import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import type { Card, Session, UserData } from "../types/global";
import { getAvailableTeams } from "../services/teamSelectionServices";
import { User } from "firebase/auth";

export const createUnsubscribeSession = (
  sessionId: string,
  setSession: (session: Session) => void
) => {
  const sessionQuery = query(
    collection(db, "sessions"),
    where("sessionId", "==", sessionId)
  );

  const unsubscribeSession = onSnapshot(sessionQuery, (snapshot) => {
    const sessionDataArray = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Session[];
    if (sessionDataArray.length === 1) {
      const sessionData = sessionDataArray[0];
      setSession(sessionData);
    }
  });

  return unsubscribeSession;
};

export const createUnsubscribeCards = (
  sessionId: string,
  setCards: (arg0: Card[]) => void
) => {
  const cardsQuery = query(
    collection(db, "cards"),
    where("sessionId", "==", sessionId)
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
  sessionId: string,
  user: User,
  setSession: (arg0: Session) => void,
  setAvailableTeams: (arg0: string[]) => void,
  setIsOwner: (arg0: boolean) => void,
  setNumOfTeams: (arg0: number) => void,
  setOwner: (arg0: string) => void,
  setMembers: (arg0: UserData[]) => void,
  navigate: ReturnType<typeof useNavigate>
) => {
  const sessionQuery = query(
    collection(db, "sessions"),
    where("id", "==", sessionId)
  );
  const unsubscribeMembers = onSnapshot(sessionQuery, (snapshot) => {
    const sessionDataArray = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Session[];
    if (sessionDataArray.length === 1) {
      const sessionData = sessionDataArray[0];
      const teamName = sessionData.teams?.[user.uid];
      if (sessionData.hasStarted) {
        if (teamName) {
          navigate(`/board/${sessionId}/team/${teamName}`);
        } else {
          navigate("/");
        }
      }
      setAvailableTeams(getAvailableTeams(sessionData.numOfTeams));
      setIsOwner(sessionData.owner === user.uid);
      setMembers(sessionData.members);
      setNumOfTeams(sessionData.numOfTeams);
      setOwner(sessionData.owner);
      setSession(sessionData);
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
