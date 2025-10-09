import { openUserContributions } from "../../../services/leaderboardServices";
import type { Card, Refinement } from "../../../types/global";
import type { LeaderboardSortTypes, UserContributions, UserStats } from "../../../types/leaderboard";

interface MembersLeaderboardProps {
  refinement: Refinement;
  sortedData: UserStats[];
  allCards: Card[],
  sortBy: LeaderboardSortTypes,
  setSelectedUser: React.Dispatch<
    React.SetStateAction<UserContributions | null>
  >,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setSortBy: React.Dispatch<React.SetStateAction<LeaderboardSortTypes>>,
}

const MembersLeaderboard: React.FC<MembersLeaderboardProps> = ({
  refinement,
  sortedData,
  allCards,
  sortBy,
  setSelectedUser,
  setIsModalOpen,
  setSortBy,
}) => {


  return (
    <div>
      {/* Sorting Controls */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setSortBy('comments')}
          className={`px-5 py-3 rounded-lg transition-all duration-200 ${sortBy === 'comments'
            ? 'bg-blue-500 text-white shadow-lg transform scale-105'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Mais Comentários
        </button>
        <button
          onClick={() => setSortBy('rating')}
          className={`px-5 py-3 rounded-lg transition-all duration-200 ${sortBy === 'rating'
            ? 'bg-blue-500 text-white shadow-lg transform scale-105'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Maiores Notas
        </button>
        <button
          onClick={() => setSortBy('replies')}
          className={`px-5 py-3 rounded-lg transition-all duration-200 ${sortBy === 'replies'
            ? 'bg-blue-500 text-white shadow-lg transform scale-105'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Mais Respostas
        </button>
        <button
          onClick={() => setSortBy('cards')}
          className={`px-5 py-3 rounded-lg transition-all duration-200 ${sortBy === 'cards'
            ? 'bg-blue-500 text-white shadow-lg transform scale-105'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Sugestões Criadas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Classificação
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comentários
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nota Média
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Respostas
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sugestões
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((user, index) => (
              <tr
                key={user.userId}
                className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => openUserContributions(user, allCards, setSelectedUser, setIsModalOpen)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-500' :
                        index === 2 ? 'text-orange-500' : 'text-gray-700'
                      }`}>
                      #{index + 1}
                    </span>
                    {index < 3 && (
                      <span className="ml-2 text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.userName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {refinement?.teams?.[user.userId] || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-semibold">
                    {user.totalComments}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-900 mr-1">
                      {user.averageRating}
                    </span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.totalReplies}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.totalCardsCreated}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">Nenhum dado disponível</p>
          <p className="text-gray-400 text-sm">
            A tabela de classificação será preenchida quando os participantes começarem a interagir
          </p>
        </div>
      )}
    </div>
  )
}

export default MembersLeaderboard;