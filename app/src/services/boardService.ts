export const calculateAverageRating = (ratings: Record<string, number>) => {
  if (!ratings || Object.keys(ratings).length === 0) return 0;
  const values = Object.values(ratings);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
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
