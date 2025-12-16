import { ChevronDown, FileText, MessageSquare, Shield, Star, Trophy, Users } from 'lucide-react';
import { openUserContributions, toggleTeamExpansion } from "../../../services/leaderboardServices";
import type { Card } from "../../../types/global";
import type { TeamMetrics, UserContributions, UserStats } from "../../../types/leaderboard";

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
            <div key={team.teamName} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300">
              <div
                className="flex justify-between items-center cursor-pointer mb-4"
                onClick={() => toggleTeamExpansion(team.teamName, expandedTeams, setExpandedTeams)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index === 0
                    ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300'
                    : index === 1
                      ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300'
                      : 'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300'
                    }`}>
                    {index === 0 && <Trophy className="w-6 h-6 text-yellow-600" />}
                    {index === 1 && <Trophy className="w-6 h-6 text-zinc-800" />}
                    {index === 2 && <Trophy className="w-6 h-6 text-orange-600" />}
                    {index > 2 && <Shield className="w-6 h-6 text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{team.teamName}</h3>
                    <p className="text-sm text-gray-600">
                      {index === 0 ? 'Primeiro Lugar' :
                        index === 1 ? 'Segundo Lugar' :
                          index === 2 ? 'Terceiro Lugar' : `#${index + 1} na classificação`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{team.totalScore || 0}</div>
                    <div className="text-sm text-gray-600">pontos</div>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 transform transition-transform ${expandedTeams.has(team.teamName) ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Team Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-700">{team.totalMembers}</div>
                  </div>
                  <div className="text-sm text-blue-800">Membros</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <div className="text-2xl font-bold text-green-700">{team.totalComments}</div>
                  </div>
                  <div className="text-sm text-green-800">Comentários</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-700">{team.totalCards}</div>
                  </div>
                  <div className="text-sm text-purple-800">Sugestões</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <div className="text-2xl font-bold text-yellow-700">{team.averageRating}</div>
                  </div>
                  <div className="text-sm text-yellow-800">Nota Média</div>
                </div>
              </div>

              {/* Team Members - Expandable */}
              {expandedTeams.has(team.teamName) && team.members.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Membros do Time ({team.members.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.members.map((member) => (
                      <div
                        key={member.userId}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                        onClick={() => openUserContributions(member, allCards, setSelectedUser, setIsModalOpen)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{member.userName}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {(member as UserStats).totalScore || 0} pontos
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-800">#{team.members.indexOf(member) + 1}</div>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                            <span className="text-blue-700">{member.totalComments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-green-600" />
                            <span className="text-green-700">{member.averageRating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-purple-600" />
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
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum time formado</h3>
          <p className="text-gray-500 text-sm">
            Os dados dos times serão exibidos quando os participantes forem atribuídos a times
          </p>
        </div>
      )}
    </div>
  );
}

export default TeamLeaderboard;