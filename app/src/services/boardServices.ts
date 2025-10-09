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
