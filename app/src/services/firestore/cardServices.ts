import { db } from "@/config/firebase";
import {
  CardMetadata,
  CardData,
  PriorityLevel,
  RequirementType,
  CategoryType,
  Card,
  MetadataType,
  VoteValue,
  CardMetadataVotes,
} from "@/types/global";
import { User } from "firebase/auth";
import {
  serverTimestamp,
  Timestamp,
  addDoc,
  collection,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  getDoc,
  deleteDoc,
  deleteField,
} from "firebase/firestore";
import _ from "lodash";

export const createCardInFirestore = async (
  newCardText: string,
  sessionId: string | undefined,
  user: User,
  teamName: string | undefined,
  setNewCardText: (text: string) => void,
  metadata?: CardMetadata
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

export const voteOnCardMetadata = async (
  cardId: string,
  metadataType: MetadataType,
  vote: VoteValue,
  user: User
): Promise<void> => {
  try {
    const cardRef = doc(db, "cards", cardId);

    const votePath = `metadataVotes.${metadataType}.${user.uid}`;

    if (!vote) {
      await updateDoc(cardRef, {
        [votePath]: deleteField(),
      });
    } else {
      await updateDoc(cardRef, {
        [votePath]: vote,
      });
    }
  } catch (error) {
    console.error("Error voting on metadata:", error);
    throw error;
  }
};

export const getMetadataVoteSummary = (
  metadataVotes: CardMetadataVotes | undefined
) => {
  const summary = {
    priority: { agree: 0, disagree: 0, neutral: 0 },
    requirementType: { agree: 0, disagree: 0, neutral: 0 },
    category: { agree: 0, disagree: 0, neutral: 0 },
    estimatedEffort: { agree: 0, disagree: 0, neutral: 0 },
  };

  if (!metadataVotes) return summary;

  const countVotes = (votes: Record<string, VoteValue> | undefined) => {
    if (!votes) return { agree: 0, disagree: 0, neutral: 0 };

    return {
      agree: Object.values(votes).filter((v) => v === "agree").length,
      disagree: Object.values(votes).filter((v) => v === "disagree").length,
      neutral: Object.values(votes).filter((v) => v === "neutral").length,
    };
  };

  summary.priority = countVotes(metadataVotes.priority);
  summary.requirementType = countVotes(metadataVotes.requirementType);
  summary.category = countVotes(metadataVotes.category);
  summary.estimatedEffort = countVotes(metadataVotes.estimatedEffort);

  return summary;
};
