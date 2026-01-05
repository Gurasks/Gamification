export const getAvailableTeams = (numOfTeams: number) => {
  const newAvailableTeams = [];
  for (let i = 0; i < numOfTeams; i++) {
    newAvailableTeams.push(`Time ${String.fromCodePoint(65 + i)}`);
  }
  return newAvailableTeams;
};
