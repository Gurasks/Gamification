import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import type { Card, PersistentUser, Refinement } from "../types/global";
import { getAvailableTeams } from "../services/teamSelectionService";

export const createUnsubscribeRefinement = (
  refinementId: string,
  setRefinement: (refinement: Refinement) => void
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
      const refinementData = refinementDataArray[0];
      setRefinement(refinementData);
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

export const createUnsubscribeSyncTimer = (
  timerId: string,
  setTimeLeft: (arg0: number) => void,
  setIsRunning: (arg0: boolean) => void,
  setEndTime: (arg0: Date | null) => void
) => {
  const timerRef = doc(db, "timers", timerId);
  const unsubscribe = onSnapshot(timerRef, (doc) => {
    const data = doc.data();
    if (!data) return;

    const { startTime, duration, isRunning } = data;
    setIsRunning(isRunning);

    if (isRunning && startTime) {
      const start = startTime.toDate();
      const end = new Date(start.getTime() + duration * 1000);
      setEndTime(end);

      const now = new Date();
      const remaining = Math.max(
        0,
        Math.floor((end.getTime() - now.getTime()) / 1000)
      );
      setTimeLeft(remaining);
    } else {
      setTimeLeft(duration);
      setEndTime(null);
    }
  });
  return unsubscribe;
};
