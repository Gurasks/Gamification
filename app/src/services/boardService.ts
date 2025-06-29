import type { Timestamp } from "firebase/firestore";

export const calculateAverageRating = (ratings: Record<string, number>) => {
  if (!ratings || Object.keys(ratings).length === 0) return 0;
  const values = Object.values(ratings);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const calculateTimeLeft = (
  firestoreStartTime: Timestamp,
  durationMinutes: number,
  durationSeconds: number
) => {
  const startTime = firestoreStartTime.toDate().getTime();
  const endTime = startTime + (durationMinutes * 60 + durationSeconds) * 1000;
  const now = Date.now();
  const timeLeft = endTime - now;
  if (timeLeft <= 0) return { minutes: 0, seconds: 0 }; // Time is up
  const secondsLeft = Math.floor(timeLeft / 1000);
  const minutesLeft = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const minutes = minutesLeft % 60;

  return { minutes, seconds };
};

export const getNextTeam = (
  currentTeam: string,
  availableTeams: string[]
): string => {
  const currentIndex = availableTeams.indexOf(currentTeam);
  if (currentIndex === -1 || availableTeams.length === 0)
    return availableTeams[0];
  const nextIndex = (currentIndex + 1) % availableTeams.length;
  return availableTeams[nextIndex];
};
