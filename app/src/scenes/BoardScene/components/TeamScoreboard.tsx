import { Button } from '@/components/Button';
import { Trophy, Users, TrendingUp, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedTeamName } from '@/services/teamSelectionServices';

interface TeamStats {
  name: string;
  cardCount: number;
}

interface TeamScoreboardProps {
  teams: TeamStats[];
  currentTeam: string;
  totalCards: number;
  showScoreboard: boolean;
  setShowScoreboard: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TeamScoreboard: React.FC<TeamScoreboardProps> = ({
  teams,
  currentTeam,
  totalCards,
  showScoreboard,
  setShowScoreboard
}) => {
  const { t } = useLanguage();
  const sortedTeams = [...teams].sort((a, b) => b.cardCount - a.cardCount);
  const leadingTeam = sortedTeams[0];

  const getPercentage = (count: number) => {
    return totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-800">{t('leaderboard:scoreboard.title')}</h3>
          </div>
        </div>
        <Button
          onClick={() => setShowScoreboard(!showScoreboard)}
          variant="outline-secondary"
          className="flex items-center justify-center gap-2"
          size='sm'
        >
          {showScoreboard ? (
            <>
              <ChevronUp className="w-4 h-4" />
              {t('leaderboard:scoreboard.hide')}
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              {t('leaderboard:scoreboard.show')}
            </>
          )}
        </Button>
      </div>
      {showScoreboard && (
        <>
          {/* Team cards */}
          <div className="space-y-4">
            {sortedTeams.map((team, index) => {
              const percentage = getPercentage(team.cardCount);
              const isCurrentTeam = team.name === currentTeam;
              const rank = index + 1;

              return (
                <div
                  key={team.name}
                  className={`relative p-4 rounded-lg border ${isCurrentTeam
                    ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-gray-200 bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {/* Ranking position */}
                      <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                      ${rank === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          rank === 2 ? 'bg-zinc-100 text-zinc-700 border border-grey-300' :
                            rank === 3 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                        <span className="text-sm font-bold">{rank}</span>
                      </div>

                      {/* Team name */}
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${isCurrentTeam ? 'text-blue-600' : 'text-gray-500'}`} />
                        <h4 className={`font-semibold ${isCurrentTeam ? 'text-blue-800' : 'text-gray-700'}`}>
                          {getLocalizedTeamName(team.name, t)}
                          {isCurrentTeam && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                              {t('team:yourTeam')}
                            </span>
                          )}
                        </h4>
                      </div>
                    </div>

                    {/* Card count */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {team.cardCount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {percentage}% {t('leaderboard:scoreboard.ofSuggestions')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary statistics */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">{t('leaderboard:scoreboard.leader')}</span>
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {leadingTeam ? getLocalizedTeamName(leadingTeam.name, t) : t('common.na')}
                </div>
                <div className="text-xs text-gray-500">
                  {leadingTeam?.cardCount || 0} {t('review:cards')}
                </div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">{t('leaderboard:scoreboard.average')}</span>
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {teams.length > 0
                    ? Math.round(teams.reduce((sum, team) => sum + team.cardCount, 0) / teams.length)
                    : 0
                  }
                </div>
                <div className="text-xs text-gray-500">
                  {t('leaderboard:scoreboard.perTeam')}
                </div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {t('team:yourTeam')}
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {teams.find(t => t.name === currentTeam)?.cardCount || 0}
                </div>
                <div className="text-xs text-gray-500">
                  {getPercentage(teams.find(t => t.name === currentTeam)?.cardCount || 0)}% {t('leaderboard:scoreboard.ofTotal')}
                </div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {t('leaderboard:scoreboard.total')}
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {totalCards}
                </div>
                <div className="text-xs text-gray-500">
                  {t('board:suggestions')}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};