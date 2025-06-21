import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import _ from "lodash";
import { db } from "../config/firebase";
import type { PersistentUser, Refinement, TimerInfo } from "../types/global";
import type { SelectionMethod } from "../types/teamSelection";
import type { SetStateAction } from "react";
import { getAvailableTeams } from "./teamSelectionService";
import type { useNavigate } from "react-router-dom";

export const createRefinementInFirestore = async (
  refinementId: string,
  refinementName: string,
  user: PersistentUser
): Promise<string> => {
  const newRefinement = {
    id: refinementId,
    title: refinementName,
    numOfTeams: 2, // Default number of teams
    selectionMethod: "OWNER_CHOOSES", // Default selection method
    createdAt: serverTimestamp(),
    members: [user],
    owner: user.id,
    teams: {},
    hasStarted: false,
  } as Refinement;

  try {
    const docRef = await addDoc(collection(db, "refinements"), newRefinement);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

// Load refinement data by ID
export const loadRefinementWithId = async (
  refinementId: string,
  setRefinement: (refinement: Refinement) => void
) => {
  const refinementDoc = await getDoc(doc(db, "refinements", refinementId));
  if (refinementDoc.exists()) {
    setRefinement(refinementDoc.data() as Refinement);
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
    _.size(refinement.teams) === refinement.members.length
  ) {
    const teamName = refinement.teams[user.id];
    if (teamName) {
      await updateDoc(doc(db, "refinements", refinementId), {
        hasStarted: true,
        startTime: serverTimestamp(),
        timerMinutes: 5,
        timerSeconds: 0,
        updatedAt: serverTimestamp(),
      });
      navigate(`/board/${refinementId}/team/${teamName}`);
    }
  }
};

export const updateTimerToRefinementInFirebase = async (
  refinementId: string,
  timerInfo: TimerInfo,
  setTime: (time: TimerInfo) => void
) => {
  if (!refinementId) return;

  try {
    await updateDoc(doc(db, "refinements", refinementId), {
      startTime: serverTimestamp(),
      timerMinutes: timerInfo.minutes,
      timerSeconds: timerInfo.seconds,
      lastUpdated: serverTimestamp(), // Additional field to force update
    });
    console.log("Timer updated successfully");
    setTime(timerInfo);
  } catch (error) {
    console.error("Error updating timer:", error);
  }
};
