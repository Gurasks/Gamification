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
  const sessionRef = doc(db, "sessions", sessionId);

  return onSnapshot(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      setSession({
        id: snapshot.id,
        ...snapshot.data(),
      } as Session);
    }
  });
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
      if (sessionData.hasStarted && sessionData.timersReady) {
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
  setTimeLeft: (time: number) => void,
  setIsRunning: (running: boolean) => void,
  setEndTime: (date: Date | null) => void
) => {
  const timerRef = doc(db, "timers", timerId);

  return onSnapshot(timerRef, (doc) => {
    if (doc.exists()) {
      const timerData = doc.data();
      const isRunning = timerData.isRunning || false;
      const startTime = timerData.startTime?.toDate();
      const duration = timerData.duration || 0;

      if (startTime && isRunning) {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000
        );
        const remaining = Math.max(0, duration - elapsed);

        setTimeLeft(remaining);
        setIsRunning(true);

        const end = new Date(startTime.getTime() + duration * 1000);
        setEndTime(end);
      } else {
        setTimeLeft(duration);
        setIsRunning(false);
        setEndTime(null);
      }
    } else {
      setTimeLeft(0);
      setIsRunning(false);
      setEndTime(null);
    }
  });
};
