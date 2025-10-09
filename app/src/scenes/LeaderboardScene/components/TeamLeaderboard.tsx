import { openUserContributions, toggleTeamExpansion } from "../../../services/leaderboardServices";
import type { TeamMetrics, UserContributions } from "../../../types/leaderboard";
import type { Card } from "../../../types/global";

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

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = (
  { teamMetrics, expandedTeams, allCards, setSelectedUser, setIsModalOpen, setExpandedTeams }
) => {
  return (
    <div>
      {teamMetrics.length > 0 ? (
        <div className="space-y-6">
          {teamMetrics.map((team, index) => (
            <div key={team.teamName} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div
                className="flex justify-between items-center cursor-pointer mb-4"
                onClick={() => toggleTeamExpansion(team.teamName, expandedTeams, setExpandedTeams)}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold ${index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-500' :
                      index === 2 ? 'text-orange-500' : 'text-gray-700'
                    }`}>
                    #{index + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-800">{team.teamName}</h3>
                  {index < 3 && (
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-6 h-6 transform transition-transform ${expandedTeams.has(team.teamName) ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Team Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{team.totalMembers}</div>
                  <div className="text-sm text-gray-600">Membros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{team.totalComments}</div>
                  <div className="text-sm text-gray-600">Comentários</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{team.totalCards}</div>
                  <div className="text-sm text-gray-600">Sugestões</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{team.averageRating}</div>
                  <div className="text-sm text-gray-600">Nota Média ⭐</div>
                </div>
              </div>

              {/* Team Members - Expandable */}
              {expandedTeams.has(team.teamName) && team.members.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3">Membros do Time:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comentários</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nota Média</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Respostas</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sugestões</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.members.map((member) => (
                          <tr
                            key={member.userId}
                            className="border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                            onClick={() => openUserContributions(member, allCards, setSelectedUser, setIsModalOpen)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">
                                  {member.userName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{member.totalComments}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{member.averageRating}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{member.totalReplies}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{member.totalCardsCreated}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">Nenhum dado de times disponível</p>
          <p className="text-gray-400 text-sm">
            Os dados dos times serão exibidos quando os participantes forem atribuídos a times
          </p>
        </div>
      )}
    </div>
  );
}

export default TeamLeaderboard;