export const getNextTeam = (
  currentTeam: string,
  availableTeams: string[]
): string => {
  if (!availableTeams.length) return currentTeam;

  const currentIndex = availableTeams.indexOf(currentTeam);

  if (currentIndex === -1) {
    return availableTeams[0];
  }

  const nextIndex = (currentIndex + 1) % availableTeams.length;

  return availableTeams[nextIndex];
};

export const getAdditionalTimeDisplay = (additionalTime: number) => {
  return additionalTime > 1 ? "s" : "";
};
