interface TeamNamingConfig {
  startFrom?: number;
}

const DEFAULT_CONFIG: TeamNamingConfig = {
  startFrom: 65, // 'A' in ASCII
};

export const getAvailableTeamIds = (
  numOfTeams: number,
  config: TeamNamingConfig = {},
): string[] => {
  const { startFrom = 65 } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const teamIds = [];
  for (let i = 0; i < numOfTeams; i++) {
    teamIds.push(String.fromCodePoint(startFrom + i));
  }
  return teamIds;
};

export const getLocalizedTeamName = (
  teamId: string,
  t: (key: string) => string,
): string => {
  const prefix = t("common.entities.team");
  return `${prefix} ${teamId}`;
};
