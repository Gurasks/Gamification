import { ChevronDown, FileText, MessageSquare, Shield, Star, Trophy, Users } from 'lucide-react';
import { openUserContributions, toggleTeamExpansion } from "../../../services/leaderboardServices";
import type { Card } from "../../../types/global";
import type { TeamMetrics, UserContributions, UserStats } from "../../../types/leaderboard";
import { useLanguage } from "@/hooks/useLanguage";
import { getLocalizedTeamName } from "@/services/teamSelectionServices";

interface TeamLeaderboardProps {
  teamMetrics: TeamMetrics[];
  expandedTeams: Set<string>;
  allCards: Card[],
  setSelectedUser: React.Dispatch<
    React.SetStateAction<UserContributions | null>
  >,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setExpandedTeams: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({
  teamMetrics,
  expandedTeams,
  allCards,
  setSelectedUser,
  setIsModalOpen,
  setExpandedTeams
}) => {
  const { t } = useLanguage();

  const handleTeamToggleKeyDown = (e: React.KeyboardEvent, teamName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTeamExpansion(teamName, expandedTeams, setExpandedTeams);
    }
  };

  const handleMemberKeyDown = (e: React.KeyboardEvent, member: UserStats) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openUserContributions(member, allCards, setSelectedUser, setIsModalOpen);
    }
  };

  const getTeamRankLabel = (index: number) => {
    switch (index) {
      case 0: return t('teamLeaderboard.firstPlace');
      case 1: return t('teamLeaderboard.secondPlace');
      case 2: return t('teamLeaderboard.thirdPlace');
      default: return t('teamLeaderboard.rankPlace', { rank: index + 1 });
    }
  };

  return (
    <div>
      {teamMetrics.length > 0 ? (
        <div className="space-y-6">
          {teamMetrics.map((team, index) => (
            <div key={team.teamName} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300">
              <div
                role="button"
                tabIndex={0}
                aria-expanded={expandedTeams.has(team.teamName)}
                aria-label={t('teamLeaderboard.teamAriaLabel', {
                  teamName: getLocalizedTeamName(team.teamName, t),
                  rank: getTeamRankLabel(index),
                  action: expandedTeams.has(team.teamName) ? t('common.actions.collapse') : t('common.actions.expand'),
                  points: team.totalScore || 0,
                  members: team.totalMembers
                })}
                onClick={() => toggleTeamExpansion(team.teamName, expandedTeams, setExpandedTeams)}
                onKeyDown={(e) => handleTeamToggleKeyDown(e, team.teamName)}
                className="flex justify-between items-center cursor-pointer mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index === 0
                    ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300'
                    : index === 1
                      ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300'
                      : 'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300'
                    }`}>
                    {index === 0 && <Trophy className="w-6 h-6 text-yellow-600" aria-hidden="true" />}
                    {index === 1 && <Trophy className="w-6 h-6 text-zinc-800" aria-hidden="true" />}
                    {index === 2 && <Trophy className="w-6 h-6 text-orange-600" aria-hidden="true" />}
                    {index > 2 && <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{getLocalizedTeamName(team.teamName, t)}</h3>
                    <p className="text-sm text-gray-600">
                      {getTeamRankLabel(index)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{team.totalScore || 0}</div>
                    <div className="text-sm text-gray-600">{t('common.metrics.points')}</div>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 transform transition-transform ${expandedTeams.has(team.teamName) ? 'rotate-180' : ''
                      }`}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Team Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg" aria-label={t('teamLeaderboard.membersAriaLabel', { count: team.totalMembers })}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <div className="text-2xl font-bold text-blue-700">{team.totalMembers}</div>
                  </div>
                  <div className="text-sm text-blue-800">{t('common.entities.members')}</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg" aria-label={t('teamLeaderboard.commentsAriaLabel', { count: team.totalComments })}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageSquare className="w-4 h-4 text-green-600" aria-hidden="true" />
                    <div className="text-2xl font-bold text-green-700">{team.totalComments}</div>
                  </div>
                  <div className="text-sm text-green-800">{t('common.content.comments')}</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg" aria-label={t('teamLeaderboard.suggestionsAriaLabel', { count: team.totalCards })}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FileText className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    <div className="text-2xl font-bold text-purple-700">{team.totalCards}</div>
                  </div>
                  <div className="text-sm text-purple-800">{t('common.content.suggestions')}</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg" aria-label={t('teamLeaderboard.avgRatingAriaLabel', { rating: team.averageRating })}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-600" aria-hidden="true" />
                    <div className="text-2xl font-bold text-yellow-700">{team.averageRating}</div>
                  </div>
                  <div className="text-sm text-yellow-800">{t('teamLeaderboard.avgRating')}</div>
                </div>
              </div>

              {/* Team Members - Expandable */}
              {expandedTeams.has(team.teamName) && team.members.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" aria-hidden="true" />
                    {t('teamLeaderboard.teamMembers', { count: team.members.length })}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.members.map((member) => (
                      <div
                        key={member.userId}
                        role="button"
                        tabIndex={0}
                        aria-label={t('teamLeaderboard.memberAriaLabel', {
                          name: member.userName,
                          points: (member as UserStats).totalScore || 0,
                          comments: member.totalComments,
                          rating: member.averageRating,
                          suggestions: member.totalCardsCreated
                        })}
                        onClick={() => openUserContributions(member, allCards, setSelectedUser, setIsModalOpen)}
                        onKeyDown={(e) => handleMemberKeyDown(e, member)}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{member.userName}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {(member as UserStats).totalScore || 0} {t('common.metrics.points')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-800">#{team.members.indexOf(member) + 1}</div>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-blue-600" aria-hidden="true" />
                            <span className="text-blue-700">{member.totalComments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-green-600" aria-hidden="true" />
                            <span className="text-green-700">{member.averageRating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-purple-600" aria-hidden="true" />
                            <span className="text-purple-700">{member.totalCardsCreated}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-gray-400" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('teamLeaderboard.noTeams')}</h3>
          <p className="text-gray-500 text-sm">
            {t('teamLeaderboard.noTeamsDescription')}
          </p>
        </div>
      )}
    </div>
  );
}

export default TeamLeaderboard;