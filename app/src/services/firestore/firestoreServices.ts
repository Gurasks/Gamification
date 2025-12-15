import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { Card } from "../../types/global";
import type { UserStats } from "../../types/leaderboard";
import { calculateAverageRating, getShortenedUUID } from "../globalServices";

export const updateTimeToSyncTimerInFirebase = async (
  timerId: string,
  secondsToAdd: number,
  userTeam?: string,
  currentTeam?: string
) => {
  if (!timerId || secondsToAdd <= 0) return;

  if (userTeam && currentTeam && userTeam !== currentTeam) {
    throw new Error("Usuário não pertence ao time atual");
  }

  try {
    const timerRef = doc(db, "timers", timerId);

    const timerDoc = await getDoc(timerRef);
    if (!timerDoc.exists()) {
      throw new Error("Timer não encontrado");
    }

    const timerData = timerDoc.data();

    const sessionRef = doc(db, "sessions", timerData.sessionId);

    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error("Sessão não encontrado");
    }
    if (sessionDoc.data().isClosed) {
      throw new Error("Sessão está encerrada");
    }
    const currentDuration = timerData.duration || 0;
    const totalDuration = timerData.totalDuration || currentDuration;

    const newTotalDuration = totalDuration + secondsToAdd;

    await updateDoc(timerRef, {
      duration: secondsToAdd,
      startTime: serverTimestamp(),
      isRunning: true,
      lastUpdated: serverTimestamp(),
      totalDuration: newTotalDuration,
    });
  } catch (error) {
    console.error("Error adding time to sync timer:", error);
    throw error;
  }
};

export const fetchLeaderboardData = async (
  sessionId: string
): Promise<UserStats[]> => {
  try {
    const cardsQuery = query(
      collection(db, "cards"),
      where("sessionId", "==", sessionId)
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

export const shortenUUID = async (uuid: string): Promise<string> => {
  const shortKey = getShortenedUUID(uuid);
  await setDoc(doc(db, "uuidMappings", shortKey), {
    uuid: uuid,
    createdAt: Date.now(),
  });

  return shortKey;
};

export const resolveUUID = async (shortKey: string): Promise<string | null> => {
  const snap = await getDoc(doc(db, "uuidMappings", shortKey));
  return snap.exists() ? (snap.data().uuid as string) : null;
};
