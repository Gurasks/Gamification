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
import type { PersistentUser } from "../types/global";
import type { SelectionMethod } from "../types/teamSelection";
import type { SetStateAction } from "react";
import { getAvailableTeams } from "./teamSelectionService";
import type { useNavigate } from "react-router-dom";

// Load refinement data by ID
export const loadRefinementWithId = async (
  refinementId: string,
  setRefinement: (arg0: DocumentData) => void
) => {
  const refinementDoc = await getDoc(doc(db, "refinements", refinementId));
  if (refinementDoc.exists()) {
    setRefinement(refinementDoc.data());
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
      createdAt: new Date(),
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
        createdAt: new Date(),
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
      });
      navigate(`/board/${refinementId}/team/${teamName}`);
    }
  }
};
