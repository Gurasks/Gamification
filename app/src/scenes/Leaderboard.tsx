import React, { useEffect, useState } from 'react';
import type { UserStats } from '../types/leaderboard';
import { fetchLeaderboardData, loadRefinementWithId } from '../services/firestoreService';
import { useParams } from 'react-router-dom';
import type { Refinement } from '../types/global';


const Leaderboard: React.FC = () => {
  const { refinementId } = useParams<{ refinementId: string }>();
  const [leaderboardData, setLeaderboardData] = useState<UserStats[]>([]);
  const [refinement, setRefinement] = useState<Refinement>();
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'comments' | 'rating' | 'replies' | 'cards'>('comments');

  useEffect(() => {
    if (!refinementId) return;

    loadLeaderboardData(refinementId);
  }, [refinementId]);

  const loadLeaderboardData = async (refinementId: string) => {
    setLoading(true);
    const fetchedLeaderboardData = await fetchLeaderboardData(refinementId);
    setLeaderboardData(fetchedLeaderboardData);
    await loadRefinementWithId(refinementId, setRefinement);
    setLoading(false);
  };

  const sortedData = [...leaderboardData].sort((a, b) => {
    switch (sortBy) {
      case 'comments':
        return b.totalComments - a.totalComments;
      case 'rating':
        return b.averageRating - a.averageRating;
      case 'replies':
        return b.totalReplies - a.totalReplies;
      case 'cards':
        return b.totalCardsCreated - a.totalCardsCreated;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Carregando leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🏆 Tabela de classificação do { }{refinement?.title || 'Refinamento'}
        </h1>

        {/* Sorting Controls */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setSortBy('comments')}
            className={`px-4 py-2 rounded-lg transition-colors ${sortBy === 'comments'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Mais Comentários
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-4 py-2 rounded-lg transition-colors ${sortBy === 'rating'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Maiores Notas
          </button>
          <button
            onClick={() => setSortBy('replies')}
            className={`px-4 py-2 rounded-lg transition-colors ${sortBy === 'replies'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Mais Respostas
          </button>
          <button
            onClick={() => setSortBy('cards')}
            className={`px-4 py-2 rounded-lg transition-colors ${sortBy === 'cards'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Sugestões Criadas
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classificação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comentários Feitos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Média de Notas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Respostas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sugestões Criadas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((user, index) => (
                <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-500' :
                          index === 2 ? 'text-orange-500' : 'text-gray-700'
                        }`}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.userName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      {user.totalComments}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="font-semibold">{user.averageRating}</span>
                      <span className="text-yellow-500 ml-1">★</span>
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
          <div className="text-center py-8 text-gray-500">
            Nenhum dado disponível na tabela de classificação.
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => refinementId && loadLeaderboardData(refinementId)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Atualizar a tabela
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;