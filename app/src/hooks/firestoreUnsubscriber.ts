import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import type { Card, PersistentUser, Refinement } from "../types/global";
import { getAvailableTeams } from "../services/teamSelectionService";

export const createUnsubscribeRefinement = (
  refinementId: string,
  setRefinement: (arg0: DocumentData) => void
) => {
  const refinementQuery = query(
    collection(db, "refinements"),
    where("refinementId", "==", refinementId)
  );
  const unsubscribeRefinement = onSnapshot(refinementQuery, (snapshot) => {
    const refinementDataArray = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Refinement[];
    if (refinementDataArray.length === 1) {
      setRefinement(refinementDataArray[0]);
    }
  });
  return unsubscribeRefinement;
};

export const createUnsubscribeCards = (
  refinementId: string,
  setCards: (arg0: Card[]) => void
) => {
  const cardsQuery = query(
    collection(db, "cards"),
    where("refinementId", "==", refinementId)
  );
  const unsubscribeCards = onSnapshot(cardsQuery, (snapshot) => {
    const cards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Card[];
    setCards(cards);
  });
  return unsubscribeCards;
};

export const createUnsubscribeMembers = (
  refinementId: string,
  user: PersistentUser,
  setRefinement: (arg0: Refinement) => void,
  setAvailableTeams: (arg0: string[]) => void,
  setIsOwner: (arg0: boolean) => void,
  setNumOfTeams: (arg0: number) => void,
  setOwner: (arg0: string) => void,
  setMembers: (arg0: PersistentUser[]) => void,
  navigate: ReturnType<typeof useNavigate>
) => {
  const refinementQuery = query(
    collection(db, "refinements"),
    where("id", "==", refinementId)
  );
  const unsubscribeMembers = onSnapshot(refinementQuery, (snapshot) => {
    const refinementDataArray = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Refinement[];
    if (refinementDataArray.length === 1) {
      const refinementData = refinementDataArray[0];
      const teamName = refinementData.teams?.[user.id];
      if (refinementData.hasStarted) {
        if (teamName) {
          navigate(`/board/${refinementId}/team/${teamName}`);
        } else {
          navigate("/");
        }
      }
      setAvailableTeams(getAvailableTeams(refinementData.numOfTeams));
      setIsOwner(refinementData.owner === user.id);
      setMembers(refinementData.members as unknown as PersistentUser[]);
      setNumOfTeams(refinementData.numOfTeams);
      setOwner(refinementData.owner);
      setRefinement(refinementData);
    }
  });

  return unsubscribeMembers;
};
