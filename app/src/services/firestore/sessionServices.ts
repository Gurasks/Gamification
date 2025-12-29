import { db } from "@/config/firebase";
import {
  Session,
  SessionCreationData,
  TeamTimer,
  UserData,
} from "@/types/global";
import { SelectionMethod } from "@/types/teamSelection";
import { User } from "firebase/auth";
import {
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import _ from "lodash";
import { SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { extractUserData } from "../globalServices";
import { getAvailableTeams } from "../teamSelectionServices";

const sessionCache = new Map<string, Session>();

const validateAndCleanSessionData = (session: Session): Session => {
  const cleaned = { ...session };

  return {
    id: String(cleaned.id || ""),
    title: String(cleaned.title || ""),
    description: String(cleaned.description || ""),
    password: cleaned.password ? String(cleaned.password) : null,
    requiresPassword: Boolean(cleaned.requiresPassword),
    numOfTeams: Number(cleaned.numOfTeams) || 2,
    selectionMethod: cleaned.selectionMethod || "OWNER_CHOOSES",
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
      title: sessionData.name.trim(),
      description: sessionData.description?.trim() || "",
      password: sessionData.password || null,
      requiresPassword: sessionData.requiresPassword || false,
      numOfTeams: 2,
      selectionMethod: "OWNER_CHOOSES",
      createdAt: serverTimestamp(),
      members: [userData],
      owner: user.uid,
      teams: {},
      hasStarted: false,
      updatedAt: serverTimestamp(),
    } as Session;

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

      await initializeTimers(sessionId, teamTimers, 600);
      console.log("Session started successfully");
      navigate(`/board/${sessionId}/team/${teamName}`);
    }
  }
};

export const getSessionTeamTimers = async (
  sessionId: string
): Promise<Record<string, TeamTimer>> => {
  try {
    const session = await getSession(sessionId);
    const teamTimers = session?.teamTimers;

    if (!teamTimers) {
      throw new Error("Não há timers inicializados");
    }

    const entries = await Promise.all(
      Object.entries(teamTimers).map(async ([teamName, timerId]) => {
        const timerDoc = await getDoc(doc(db, "timers", timerId));

        if (!timerDoc.exists()) {
          return null;
        }

        const timer: TeamTimer = {
          id: timerDoc.id,
          ...(timerDoc.data() as Omit<TeamTimer, "id">),
        };

        return [teamName, timer] as const;
      })
    );

    const validEntries = entries.filter(
      (entry): entry is readonly [string, TeamTimer] => entry !== null
    );

    return Object.fromEntries(validEntries);
  } catch (error) {
    console.error("Error getting session timers:", error);
    return {};
  }
};
