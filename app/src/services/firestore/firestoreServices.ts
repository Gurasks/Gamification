import { User } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import _ from "lodash";
import type { SetStateAction } from "react";
import type { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../config/firebase";
import type {
  Card,
  CardData,
  CategoryType,
  PriorityLevel,
  RequirementType,
  Session,
  SessionCreationData,
  UserData,
} from "../../types/global";
import type { UserStats } from "../../types/leaderboard";
import type { SelectionMethod } from "../../types/teamSelection";
import {
  calculateAverageRating,
  extractUserData,
  getShortenedUUID,
} from "../globalServices";
import { getAvailableTeams } from "../teamSelectionServices";

const sessionCache = new Map<string, Session>();

const validateAndCleanSessionData = (session: any): any => {
  // Remove qualquer campo que possa conter objetos complexos
  const cleaned = { ...session };

  // Garante que todos os campos são serializáveis
  return {
    id: String(cleaned.id || ""),
    title: String(cleaned.title || ""),
    description: String(cleaned.description || ""),
    password: cleaned.password ? String(cleaned.password) : null,
    requiresPassword: Boolean(cleaned.requiresPassword),
    numOfTeams: Number(cleaned.numOfTeams) || 2,
    selectionMethod: String(cleaned.selectionMethod || "OWNER_CHOOSES"),
    createdAt: cleaned.createdAt,
    members: Array.isArray(cleaned.members)
      ? cleaned.members.map((member: any) => ({
          uid: String(member.uid || ""),
          displayName: String(member.displayName || "Usuário"),
          email: String(member.email || ""),
          isAnonymous: Boolean(member.isAnonymous),
        }))
      : [],
    owner: String(cleaned.owner || ""),
    teams: typeof cleaned.teams === "object" ? cleaned.teams : {},
    hasStarted: Boolean(cleaned.hasStarted),
    updatedAt: cleaned.updatedAt,
  };
};

export const createSessionInFirestore = async (
  sessionId: string,
  sessionData: SessionCreationData,
  user: User
): Promise<string> => {
  try {
    if (!sessionData.name?.trim()) {
      throw new Error("Nome da sessão é obrigatório");
    }

    const userData = extractUserData(user);

    const newSession = {
      id: sessionId,
      title: sessionData.name.trim(), // ← DEVE ser 'title' não 'name'
      description: sessionData.description?.trim() || "",
      password: sessionData.password || null,
      requiresPassword: sessionData.requiresPassword || false,
      numOfTeams: 2, // ← Campo obrigatório nas regras
      selectionMethod: "OWNER_CHOOSES",
      createdAt: serverTimestamp(),
      members: [userData], // ← DEVE ser array
      owner: user.uid, // ← Campo obrigatório
      teams: {},
      hasStarted: false,
      updatedAt: serverTimestamp(),
    };

    const cleanedSession = validateAndCleanSessionData(newSession);

    const docRef = doc(db, "sessions", sessionId);
    await setDoc(docRef, cleanedSession);

    return sessionId;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create session: ${error.message}`);
    } else {
      throw new Error("Failed to create session: Unknown error");
    }
  }
};

// Load session data by ID
export const loadSessionWithId = async (
  sessionId: string,
  setSession: (session: Session) => void
) => {
  const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
  if (sessionDoc.exists()) {
    const sessionData = sessionDoc.data() as Session;
    if (!sessionData) {
      console.error("Session data is undefined");
      return;
    }
    setSession(sessionData);
  }
};

export const getSession = async (
  sessionId: string
): Promise<Session | null> => {
  if (sessionCache.has(sessionId)) {
    return sessionCache.get(sessionId)!;
  }

  try {
    const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
    if (sessionDoc.exists()) {
      const session = {
        id: sessionDoc.id,
        ...sessionDoc.data(),
      } as Session;

      sessionCache.set(sessionId, session);
      return session;
    }
    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

export const endSession = async (sessionId: string, user: User) => {
  const docRef = doc(db, "sessions", sessionId);
  const sessionDoc = await getDoc(docRef);

  if (sessionDoc.exists()) {
    const sessionData = sessionDoc.data();
    const sessionOwner = sessionData.owner;
    if (sessionOwner !== user.uid) {
      return "notOwner";
    } else {
      await updateDoc(docRef, {
        isClosed: true,
        updatedAt: serverTimestamp(),
      });
      return "success";
    }
  } else {
    return "notFound";
  }
};

export const updateDocumentListMembers = async (
  sessionId: string,
  user: User
) => {
  const docRef = doc(db, "sessions", sessionId);
  const sessionDoc = await getDoc(docRef);

  if (sessionDoc.exists()) {
    const sessionData = sessionDoc.data();
    let membersList = sessionData.members || [];

    if (!Array.isArray(membersList)) {
      membersList = [];
    }

    const userData = extractUserData(user);

    const memberExists = membersList.find(
      (member: UserData) => member.uid === user.uid
    );

    if (!memberExists && !sessionData.hasStarted) {
      membersList.push(userData);

      try {
        await updateDoc(docRef, {
          members: membersList,
        });

        return "success";
      } catch (error) {
        return "error";
      }
    } else if (!memberExists && sessionData.hasStarted) {
      return "started";
    } else {
      return "inSession";
    }
  } else {
    return "notFound";
  }
};

// Remove usuário da lista de membros
export const removeUserFromSession = async (
  sessionId: string,
  userId: string
) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (sessionDoc.exists()) {
      const sessionData = sessionDoc.data();
      let membersList = sessionData.members || ([] as UserData[]);

      const updatedMembers = membersList.filter(
        (member: UserData) => member.uid !== userId
      );

      await updateDoc(sessionRef, {
        members: updatedMembers,
      });
    }
  } catch (error) {
    throw error;
  }
};

export const deleteSession = async (sessionId: string) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    await deleteDoc(sessionRef);
    console.log("Sala excluída com sucesso");
  } catch (error) {
    console.error("Erro ao excluir sala:", error);
    throw error;
  }
};

// Create a new card
export const createCardInFirestore = async (
  newCardText: string,
  sessionId: string | undefined,
  user: User,
  teamName: string | undefined,
  setNewCardText: (text: string) => void,
  metadata?: {
    priority?: PriorityLevel;
    requirementType?: RequirementType;
    category?: CategoryType;
    estimatedEffort?: number;
    tags?: string[];
  }
) => {
  if (!sessionId || !teamName || !newCardText.trim() || _.isEmpty(user)) return;
  try {
    const cardData: CardData = {
      text: newCardText,
      sessionId,
      createdBy: String(user.displayName || "Usuário"),
      createdById: user.uid,
      teamName,
      createdAt: serverTimestamp() as Timestamp,
    };

    if (metadata) {
      if (metadata.priority) cardData.priority = metadata.priority;
      if (metadata.requirementType)
        cardData.requirementType = metadata.requirementType;
      if (metadata.category) cardData.category = metadata.category;
      if (metadata.estimatedEffort)
        cardData.estimatedEffort = metadata.estimatedEffort;
      if (metadata.tags) cardData.tags = metadata.tags;
    }

    await addDoc(collection(db, "cards"), cardData);

    setNewCardText("");
  } catch (error) {
    console.error("Error creating card:", error);
    throw error;
  }
};

export const updateCardMetadataInFirestore = async (
  cardId: string,
  metadata: {
    priority?: PriorityLevel;
    requirementType?: RequirementType;
    category?: CategoryType;
    estimatedEffort?: number;
    tags?: string[];
  }
): Promise<void> => {
  try {
    const cardRef = doc(db, "cards", cardId);
    await updateDoc(cardRef, {
      ...metadata,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating card metadata:", error);
    throw error;
  }
};

// Update card rating
export const updateRatingToCardInFirestore = async (
  cardId: string,
  rating: number,
  user: User
) => {
  if (!user?.uid) return;

  const cardRef = doc(db, "cards", cardId);
  await updateDoc(cardRef, {
    [`ratings.${user.uid}`]: rating,
  });
};

// Update card text
export const updateCardInFirestore = async (
  cardId: string,
  newText: string
): Promise<void> => {
  try {
    const cardRef = doc(db, "cards", cardId);
    await updateDoc(cardRef, {
      text: newText,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating card:", error);
    throw error;
  }
};

export const getCardsBySessionId = async (
  sessionId: string
): Promise<Card[]> => {
  try {
    const cardsQuery = query(
      collection(db, "cards"),
      where("sessionId", "==", sessionId)
    );
    const cardsSnapshot = await getDocs(cardsQuery);

    const cards: Card[] = [];
    cardsSnapshot.forEach((doc) => {
      cards.push({
        id: doc.id,
        ...doc.data(),
      } as Card);
    });

    return cards;
  } catch (error) {
    console.error("Error fetching cards:", error);
    return [];
  }
};

// Add comment to card
export const addCommentToCardInFirestore = async (
  cardId: string,
  commentText: string,
  user: User
): Promise<void> => {
  try {
    const cardRef = doc(db, "cards", cardId);

    await updateDoc(cardRef, {
      comments: arrayUnion({
        id: `${Date.now()}`,
        text: commentText,
        createdBy: user.displayName,
        createdById: user.uid,
        createdAt: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Update comment in card
export const updateCommentToCardInFirestore = async (
  cardId: string,
  commentId: string,
  commentText: string
): Promise<void> => {
  try {
    const cardRef = doc(db, "cards", cardId);
    const cardSnap = await getDoc(cardRef);
    const card = cardSnap.data();
    if (card && card.comments) {
      // Find the index of the comment to update
      const commentIndex = card.comments?.findIndex(
        (comment: { id: string }) => comment.id === commentId
      );
      if (commentIndex !== -1) {
        const updatedComments = [...card.comments];
        updatedComments[commentIndex] = {
          ...updatedComments[commentIndex],
          text: commentText,
          updatedAt: new Date(),
        };
        await updateDoc(cardRef, {
          comments: updatedComments,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

export const updateSelectionMethodToSessionInFirebase = async (
  sessionId: string,
  method: SelectionMethod
) => {
  if (!sessionId) return;
  await updateDoc(doc(db, "sessions", sessionId), {
    selectionMethod: method,
    updatedAt: serverTimestamp(),
  });
};

export const updateNumOfTeamsToSessionInFirebase = async (
  sessionId: string,
  setAvailableTeams: (teams: string[]) => void,
  e: {
    target: { value: SetStateAction<string> };
  }
) => {
  const newNumOfTeams = parseInt(e.target.value as string);
  if (!sessionId) return;
  await updateDoc(doc(db, "sessions", sessionId), {
    numOfTeams: newNumOfTeams,
    updatedAt: serverTimestamp(),
  });
  setAvailableTeams(getAvailableTeams(newNumOfTeams));
};

export const startSessionInFirebase = async (
  session: DocumentData | undefined,
  sessionId: string | undefined,
  user: User,
  navigate: ReturnType<typeof useNavigate>
) => {
  if (
    sessionId &&
    session?.teams &&
    _.size(session.teams) === session.members.length
  ) {
    const teamName = session.teams[user.uid];
    if (teamName) {
      const availableTeams = getAvailableTeams(session.numOfTeams);
      const teamTimers = availableTeams.reduce((acc, team) => {
        acc[team] = uuidv4();
        return acc;
      }, {} as Record<string, string>);

      await updateDoc(doc(db, "sessions", sessionId), {
        hasStarted: true,
        startTime: serverTimestamp(),
        teamTimers: teamTimers,
        updatedAt: serverTimestamp(),
      });

      await initializeTimers(sessionId, teamTimers, 300);
      console.log("Session started successfully");
      navigate(`/board/${sessionId}/team/${teamName}`);
    }
  }
};

const initializeTimers = async (
  sessionId: string,
  teamTimers: Record<string, string>,
  initialDuration: number
) => {
  Object.values(teamTimers).forEach(async (timerId) => {
    await setDoc(doc(db, "timers", timerId), {
      sessionId: sessionId,
      totalDuration: initialDuration,
      startTime: serverTimestamp(),
      duration: initialDuration,
      isRunning: true,
      lastUpdated: serverTimestamp(),
    });
  });
};

export const updateTimeToSyncTimerInFirebase = async (
  timerId: string,
  secondsToAdd: number,
  userTeam?: string,
  currentTeam?: string
) => {
  if (!timerId || secondsToAdd <= 0) return;

  if (userTeam && currentTeam && userTeam !== currentTeam) {
    throw new Error("Usuário não pertence ao time atual");
  }

  try {
    const timerRef = doc(db, "timers", timerId);

    const timerDoc = await getDoc(timerRef);
    if (!timerDoc.exists()) {
      throw new Error("Timer não encontrado");
    }

    const timerData = timerDoc.data();

    const sessionRef = doc(db, "sessions", timerData.sessionId);

    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error("Sessão não encontrado");
    }
    if (sessionDoc.data().isClosed) {
      throw new Error("Sessão está encerrada");
    }
    const currentDuration = timerData.duration || 0;
    const totalDuration = timerData.totalDuration || currentDuration;

    const newTotalDuration = totalDuration + secondsToAdd;

    await updateDoc(timerRef, {
      duration: secondsToAdd,
      startTime: serverTimestamp(),
      isRunning: true,
      lastUpdated: serverTimestamp(),
      totalDuration: newTotalDuration,
    });
  } catch (error) {
    console.error("Error adding time to sync timer:", error);
    throw error;
  }
};

export const fetchLeaderboardData = async (
  sessionId: string
): Promise<UserStats[]> => {
  try {
    const cardsQuery = query(
      collection(db, "cards"),
      where("sessionId", "==", sessionId)
    );
    const cardsSnapshot = await getDocs(cardsQuery);

    const userStatsMap = new Map<string, UserStats>();

    cardsSnapshot.forEach((cardDoc) => {
      const card = cardDoc.data() as Card;
      const comments = card.comments || [];

      comments.forEach((comment: any) => {
        const userId = comment.createdById;
        const userName = comment.createdBy;

        if (!userStatsMap.has(userId)) {
          userStatsMap.set(userId, {
            userId,
            userName,
            totalComments: 0,
            totalReplies: 0,
            averageRating: 0,
            totalCardsCreated: 0,
          });
        }

        const userStats = userStatsMap.get(userId)!;
        // O totalComments são os comentários feitos por usuário em diferentes cards
        userStats.totalComments++;
      });

      // Process each card
      const userId = card.createdById;
      const userName = card.createdBy;

      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          userId,
          userName,
          totalReplies: 0,
          totalComments: 0,
          averageRating: 0,
          totalCardsCreated: 0,
        });
      }

      const userStats = userStatsMap.get(userId)!;

      // Calculate ratings if available
      if (card.ratings !== undefined) {
        userStats.averageRating += calculateAverageRating(card.ratings);
      }
      // comments são os comentários dentro dos cards e não os comentários feitos pelos usuários
      if (card.comments) {
        // Os replies são os comentários dentro dos cards que são o número de comentários feitos
        // por todos os usuários
        userStats.totalReplies += card.comments.length;
      }

      userStatsMap.get(userId)!.totalCardsCreated++;
    });

    const leaderboardData: UserStats[] = Array.from(userStatsMap.values()).map(
      (user) => ({
        userId: user.userId,
        userName: user.userName,
        averageRating:
          user.totalCardsCreated > 0
            ? Number(
                (Number(user.averageRating) / user.totalCardsCreated).toFixed(1)
              )
            : 0,
        totalCardsCreated: user.totalCardsCreated,
        totalComments: user.totalComments,
        totalReplies: user.totalReplies,
      })
    );

    return leaderboardData.sort((a, b) => b.totalComments - a.totalComments);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
};

// shorten a UUID and store in Firestore
export const shortenUUID = async (uuid: string): Promise<string> => {
  const shortKey = getShortenedUUID(uuid);
  await setDoc(doc(db, "uuidMappings", shortKey), {
    uuid: uuid,
    createdAt: Date.now(),
  });

  return shortKey;
};

// resolve short key → original UUID
export const resolveUUID = async (shortKey: string): Promise<string | null> => {
  const snap = await getDoc(doc(db, "uuidMappings", shortKey));
  return snap.exists() ? (snap.data().uuid as string) : null;
};

export const deleteCardInFirestore = async (cardId: string): Promise<void> => {
  try {
    const cardRef = doc(db, "cards", cardId);
    await deleteDoc(cardRef);
    console.log("Card deletado com sucesso");
  } catch (error) {
    console.error("Error deleting card:", error);
    throw error;
  }
};

export const deleteCommentFromCardInFirestore = async (
  cardId: string,
  commentId: string
): Promise<void> => {
  try {
    const cardRef = doc(db, "cards", cardId);
    const cardSnap = await getDoc(cardRef);
    const card = cardSnap.data();

    if (card && card.comments) {
      const updatedComments = card.comments.filter(
        (comment: { id: string }) => comment.id !== commentId
      );

      await updateDoc(cardRef, {
        comments: updatedComments,
        updatedAt: serverTimestamp(),
      });

      console.log("Comentário deletado com sucesso");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
