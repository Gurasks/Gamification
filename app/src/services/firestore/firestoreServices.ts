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
  Refinement,
  RefinementCreationData,
  UserData,
} from "../../types/global";
import type { UserStats } from "../../types/leaderboard";
import type { SelectionMethod } from "../../types/teamSelection";
import { calculateAverageRating, extractUserData } from "../globalServices";
import { getShortenedUUID } from "../globalServices";
import { getAvailableTeams } from "../teamSelectionServices";
import { User } from "firebase/auth";

const refinementCache = new Map<string, Refinement>();

const validateAndCleanRefinementData = (refinement: any): any => {
  // Remove qualquer campo que possa conter objetos complexos
  const cleaned = { ...refinement };

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

export const createRefinementInFirestore = async (
  refinementId: string,
  refinementData: RefinementCreationData,
  user: User
): Promise<string> => {
  try {
    if (!refinementData.name?.trim()) {
      throw new Error("Nome da sessão é obrigatório");
    }

    if (refinementData.requiresPassword && !refinementData.password) {
      throw new Error("Senha é obrigatória quando a proteção está ativada");
    }

    const userData = extractUserData(user);

    const newRefinement = {
      id: refinementId,
      title: refinementData.name.trim(),
      description: refinementData.description?.trim() || "",
      password: refinementData.password || null,
      requiresPassword: refinementData.requiresPassword || false,
      numOfTeams: 2,
      selectionMethod: "OWNER_CHOOSES",
      createdAt: serverTimestamp(),
      members: [userData],
      owner: user.uid,
      teams: {},
      hasStarted: false,
      updatedAt: serverTimestamp(),
    };

    const cleanedRefinement = validateAndCleanRefinementData(newRefinement);

    const docRef = doc(db, "refinements", refinementId);
    await setDoc(docRef, cleanedRefinement);

    return refinementId;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create refinement: ${error.message}`);
    } else {
      throw new Error("Failed to create refinement: Unknown error");
    }
  }
};

// Load refinement data by ID
export const loadRefinementWithId = async (
  refinementId: string,
  setRefinement: (refinement: Refinement) => void
) => {
  const refinementDoc = await getDoc(doc(db, "refinements", refinementId));
  if (refinementDoc.exists()) {
    const refinementData = refinementDoc.data() as Refinement;
    if (!refinementData) {
      console.error("Refinement data is undefined");
      return;
    }
    setRefinement(refinementData);
  }
};

export const getRefinement = async (
  refinementId: string
): Promise<Refinement | null> => {
  if (refinementCache.has(refinementId)) {
    return refinementCache.get(refinementId)!;
  }

  try {
    const refinementDoc = await getDoc(doc(db, "refinements", refinementId));
    if (refinementDoc.exists()) {
      const refinement = {
        id: refinementDoc.id,
        ...refinementDoc.data(),
      } as Refinement;

      refinementCache.set(refinementId, refinement);
      return refinement;
    }
    return null;
  } catch (error) {
    console.error("Error getting refinement:", error);
    return null;
  }
};

export const updateDocumentListMembers = async (
  refinementId: string,
  user: User
) => {
  const docRef = doc(db, "refinements", refinementId);
  const refinementDoc = await getDoc(docRef);

  if (refinementDoc.exists()) {
    const refinementData = refinementDoc.data();
    let membersList = refinementData.members || [];

    if (!Array.isArray(membersList)) {
      membersList = [];
    }

    const userData = extractUserData(user);

    const memberExists = membersList.find(
      (member: UserData) => member.uid === user.uid
    );

    if (!memberExists && !refinementData.hasStarted) {
      membersList.push(userData);

      try {
        await updateDoc(docRef, {
          members: membersList,
        });

        return "success";
      } catch (error) {
        return "error";
      }
    } else if (!memberExists && refinementData.hasStarted) {
      return "started";
    } else {
      return "inRefinement";
    }
  } else {
    return "notFound";
  }
};

// Remove usuário da lista de membros
export const removeUserFromRefinement = async (
  refinementId: string,
  userId: string
) => {
  try {
    const refinementRef = doc(db, "refinements", refinementId);
    const refinementDoc = await getDoc(refinementRef);

    if (refinementDoc.exists()) {
      const refinementData = refinementDoc.data();
      let membersList = refinementData.members || ([] as UserData[]);

      const updatedMembers = membersList.filter(
        (member: UserData) => member.uid !== userId
      );

      await updateDoc(refinementRef, {
        members: updatedMembers,
      });
    }
  } catch (error) {
    throw error;
  }
};

// Excluir refinamento completo (apenas para dono)
export const deleteRefinement = async (refinementId: string) => {
  try {
    const refinementRef = doc(db, "refinements", refinementId);
    await deleteDoc(refinementRef);
    console.log("Sala excluída com sucesso");
  } catch (error) {
    console.error("Erro ao excluir sala:", error);
    throw error;
  }
};

// Create a new card
export const createCardInFirestore = async (
  newCardText: string,
  refinementId: string | undefined,
  user: User,
  teamName: string | undefined,
  setNewCardText: (text: string) => void
) => {
  if (!refinementId || !teamName || !newCardText.trim() || _.isEmpty(user))
    return;
  try {
    await addDoc(collection(db, "cards"), {
      text: newCardText,
      refinementId,
      createdBy: user.displayName,
      createdById: user.uid,
      teamName,
      votes: [],
      createdAt: serverTimestamp(),
    });

    setNewCardText("");
  } catch (error) {
    console.error("Error creating card:", error);
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

export const getCardsByRefinementId = async (
  refinementId: string
): Promise<Card[]> => {
  try {
    const cardsQuery = query(
      collection(db, "cards"),
      where("refinementId", "==", refinementId)
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

export const updateSelectionMethodToRefinementInFirebase = async (
  refinementId: string,
  method: SelectionMethod
) => {
  if (!refinementId) return;
  await updateDoc(doc(db, "refinements", refinementId), {
    selectionMethod: method,
    updatedAt: serverTimestamp(),
  });
};

export const updateNumOfTeamsToRefinementInFirebase = async (
  refinementId: string,
  setAvailableTeams: (teams: string[]) => void,
  e: {
    target: { value: SetStateAction<string> };
  }
) => {
  const newNumOfTeams = parseInt(e.target.value as string);
  if (!refinementId) return;
  await updateDoc(doc(db, "refinements", refinementId), {
    numOfTeams: newNumOfTeams,
    updatedAt: serverTimestamp(),
  });
  setAvailableTeams(getAvailableTeams(newNumOfTeams));
};

export const startRefinementInFirebase = async (
  refinement: DocumentData | undefined,
  refinementId: string | undefined,
  user: User,
  navigate: ReturnType<typeof useNavigate>
) => {
  if (
    refinementId &&
    refinement &&
    refinement.teams &&
    _.size(refinement.teams) === refinement.members.length
  ) {
    const teamName = refinement.teams[user.uid];
    if (teamName) {
      const availableTeams = getAvailableTeams(refinement.numOfTeams);
      const teamTimers = availableTeams.reduce((acc, team) => {
        acc[team] = uuidv4();
        return acc;
      }, {} as Record<string, string>);

      await updateDoc(doc(db, "refinements", refinementId), {
        hasStarted: true,
        startTime: serverTimestamp(),
        teamTimers: teamTimers,
        updatedAt: serverTimestamp(),
      });

      await initializeTimers(teamTimers, 300);
      console.log("Refinement started successfully");
      navigate(`/board/${refinementId}/team/${teamName}`);
    }
  }
};

export const initializeTimers = async (
  teamTimers: Record<string, string>,
  initialDuration: number
) => {
  Object.values(teamTimers).forEach(async (timerId) => {
    await setDoc(doc(db, "timers", timerId), {
      startTime: serverTimestamp(),
      duration: initialDuration,
      isRunning: true,
      lastUpdated: serverTimestamp(),
    });
  });
};

export const updateTimeToSyncTimerInFirebase = async (
  timerId: string,
  timeLeft: number,
  seconds: number
) => {
  if (!timerId || seconds <= 0) return;

  try {
    const timerRef = doc(db, "timers", timerId);
    await updateDoc(timerRef, {
      duration: timeLeft + seconds,
      startTime: serverTimestamp(),
      isRunning: true,
      lastUpdated: serverTimestamp(),
    });
    console.log("Time added successfully");
  } catch (error) {
    console.error("Error adding time to sync timer:", error);
  }
};

export const fetchLeaderboardData = async (
  refinementId: string
): Promise<UserStats[]> => {
  try {
    const cardsQuery = query(
      collection(db, "cards"),
      where("refinementId", "==", refinementId)
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
