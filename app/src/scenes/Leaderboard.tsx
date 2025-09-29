import React, { useEffect, useState } from 'react';
import type { UserStats } from '../types/leaderboard';
import { fetchLeaderboardData, getRefinement } from '../services/firestoreService';
import { useParams } from 'react-router-dom';
import type { Refinement } from '../types/global';

const Leaderboard: React.FC = () => {
  const { refinementId } = useParams<{ refinementId: string }>();
  const [leaderboardData, setLeaderboardData] = useState<UserStats[]>([]);
  const [refinement, setRefinement] = useState<Refinement | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'comments' | 'rating' | 'replies' | 'cards'>('comments');

  useEffect(() => {
    if (!refinementId) return;
    loadLeaderboardData(refinementId);
  }, [refinementId]);

  const loadLeaderboardData = async (refinementId: string) => {
    setLoading(true);
    try {
      const [fetchedLeaderboardData, refinementData] = await Promise.all([
        fetchLeaderboardData(refinementId),
        getRefinement(refinementId)
      ]);

      setLeaderboardData(fetchedLeaderboardData);
      setRefinement(refinementData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedData = [...leaderboardData].sort((a, b) => {
    switch (sortBy) {
      case 'comments': return b.totalComments - a.totalComments;
      case 'rating': return b.averageRating - a.averageRating;
      case 'replies': return b.totalReplies - a.totalReplies;
      case 'cards': return b.totalCardsCreated - a.totalCardsCreated;
      default: return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tabela de classificação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏆</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Tabela de Classificação
            </h1>
            <p className="text-gray-600 text-lg">
              {refinement?.title || 'Sessão de Refinamento'}
            </p>
            {refinement?.description && (
              <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto">
                {refinement.description}
              </p>
            )}
          </div>

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

          {/* Leaderboard Table */}
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
                    className="hover:bg-gray-50 transition-colors duration-200"
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

          {/* Refresh Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => refinementId && loadLeaderboardData(refinementId)}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              Atualizar Tabela
            </button>
          </div>

          {/* Stats Summary */}
          {sortedData.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{sortedData.length}</p>
                  <p className="text-sm text-gray-600">Participantes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {sortedData.reduce((sum, user) => sum + user.totalComments, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Comentários</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {sortedData.reduce((sum, user) => sum + user.totalCardsCreated, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Sugestões</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.max(...sortedData.map(user => user.averageRating), 0).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Maior Nota</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;