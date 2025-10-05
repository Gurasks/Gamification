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
import { db } from "../config/firebase";
import type {
  Card,
  PersistentUser,
  Refinement,
  RefinementCreationData,
} from "../types/global";
import type { UserStats } from "../types/leaderboard";
import type { SelectionMethod } from "../types/teamSelection";
import { calculateAverageRating } from "./boardService";
import { getShortenedUUID } from "./globalServices";
import { getAvailableTeams } from "./teamSelectionService";

const refinementCache = new Map<string, Refinement>();

export const createRefinementInFirestore = async (
  refinementId: string,
  refinementData: RefinementCreationData,
  user: PersistentUser
): Promise<string> => {
  try {
    const newRefinement = {
      id: refinementId,
      title: refinementData.name,
      description: refinementData.description || "",
      password: refinementData.password || null,
      requiresPassword: refinementData.requiresPassword || false,
      numOfTeams: 2,
      selectionMethod: "OWNER_CHOOSES",
      createdAt: serverTimestamp(),
      members: [user],
      owner: user.id,
      teams: {},
      hasStarted: false,
      updatedAt: serverTimestamp(),
    } as Refinement;

    const docRef = doc(db, "refinements", refinementId);
    await setDoc(docRef, newRefinement);

    console.log("Document written with ID: ", refinementId);
    return refinementId;
  } catch (error) {
    console.error("Error adding document: ", error);
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
  user: PersistentUser
) => {
  const docRef = doc(db, "refinements", refinementId);
  const refinementDoc = await getDoc(doc(db, "refinements", refinementId));
  if (refinementDoc.exists()) {
    const refinementData = refinementDoc.data() as Refinement;
    const membersList = refinementData.members;
    const memberExists = membersList.find((member) => member.id === user.id);
    if (!memberExists && !refinementData.hasStarted) {
      membersList.push(user);
    } else if (!memberExists && refinementData.hasStarted) {
      console.log("Refinement has already started, cannot join");
      return "started";
    } else {
      console.log("User already exists in the members list");
      return "inRefinement";
    }

    try {
      await updateDoc(docRef, {
        ...refinementData,
        members: membersList,
      });
      console.log("Document updated successfully");
      return "success";
    } catch (error) {
      console.error("Error updating document: ", error);
      return "error";
    }
  } else {
    console.log("Document doesn't exist!");
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
      const updatedMembers = refinementData.members.filter(
        (member: PersistentUser) => member.id !== userId
      );

      await updateDoc(refinementRef, {
        members: updatedMembers,
      });

      console.log("Usuário removido da sala com sucesso");
    }
  } catch (error) {
    console.error("Erro ao remover usuário da sala:", error);
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
  user: PersistentUser,
  teamName: string | undefined,
  setNewCardText: (text: string) => void
) => {
  if (!refinementId || !teamName || !newCardText.trim() || _.isEmpty(user))
    return;
  try {
    await addDoc(collection(db, "cards"), {
      text: newCardText,
      refinementId,
      createdBy: user.name,
      createdById: user.id,
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
  user: PersistentUser
) => {
  if (!user?.id) return;

  const cardRef = doc(db, "cards", cardId);
  await updateDoc(cardRef, {
    [`ratings.${user.id}`]: rating,
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

// Add comment to card
export const addCommentToCardInFirestore = async (
  cardId: string,
  commentText: string,
  user: { id: string; name: string }
): Promise<void> => {
  try {
    const cardRef = doc(db, "cards", cardId);

    await updateDoc(cardRef, {
      comments: arrayUnion({
        id: `${Date.now()}`,
        text: commentText,
        createdBy: user.name,
        createdById: user.id,
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
  user: PersistentUser,
  navigate: ReturnType<typeof useNavigate>
) => {
  if (
    refinementId &&
    refinement &&
    refinement.teams &&
    _.size(refinement.teams) === refinement.members.length
  ) {
    const teamName = refinement.teams[user.id];
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
