import React, { useEffect, useState } from 'react';
import type { LeaderboardSortTypes, TabType, TeamMetrics, UserContributions, UserStats } from '../../types/leaderboard';
import { fetchLeaderboardData, getRefinement, getCardsByRefinementId } from '../../services/firestore/firestoreServices';
import { useParams } from 'react-router-dom';
import type { Refinement, Card } from '../../types/global';
import { getAvailableTeams } from '../../services/teamSelectionServices';
import { exportToDOC, exportToPDF } from '../../services/leaderboardServices';
import TeamLeaderboard from './components/TeamLeaderboard';
import MembersLeaderboard from './components/MembersLeaderboard';
import ContributionsModal from './components/ContributionsModal';
import { LoadingOverlay } from '../../components/LoadingOverlay';

const LeaderboardScene: React.FC = () => {
  const { refinementId } = useParams<{ refinementId: string }>();
  const [leaderboardData, setLeaderboardData] = useState<UserStats[]>([]);
  const [refinement, setRefinement] = useState<Refinement | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<LeaderboardSortTypes>('comments');
  const [activeTab, setActiveTab] = useState<TabType>('participants');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserContributions | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!refinementId) return;
    loadLeaderboardData(refinementId);
  }, [refinementId]);

  const loadLeaderboardData = async (refinementId: string) => {
    setLoading(true);
    try {
      const [fetchedLeaderboardData, refinementData, cardsData] = await Promise.all([
        fetchLeaderboardData(refinementId),
        getRefinement(refinementId),
        getCardsByRefinementId(refinementId)
      ]);

      setLeaderboardData(fetchedLeaderboardData);
      setRefinement(refinementData);
      setAllCards(cardsData);
      calculateTeamMetrics(fetchedLeaderboardData, refinementData, cardsData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamMetrics = (users: UserStats[], refinementData: Refinement | null, cards: Card[]) => {
    if (!refinementData || !refinementData.teams) {
      setTeamMetrics([]);
      return;
    }

    const teams = getAvailableTeams(refinementData.numOfTeams || 2);
    const metrics: TeamMetrics[] = [];

    teams.forEach(teamName => {
      const teamMembers = users.filter(user =>
        refinementData.teams && refinementData.teams[user.userId] === teamName
      );

      const teamCards = cards.filter(card => card.teamName === teamName);

      const teamMetric: TeamMetrics = {
        teamName,
        members: teamMembers.sort((a, b) => b.totalComments - a.totalComments),
        totalComments: teamMembers.reduce((sum, user) => sum + user.totalComments, 0),
        totalCards: teamCards.length,
        totalReplies: teamMembers.reduce((sum, user) => sum + user.totalReplies, 0),
        averageRating: teamMembers.length > 0
          ? Number((teamMembers.reduce((sum, user) => sum + user.averageRating, 0) / teamMembers.length).toFixed(1))
          : 0,
        totalMembers: teamMembers.length
      };

      metrics.push(teamMetric);
    });

    setTeamMetrics(metrics.sort((a, b) => b.totalComments - a.totalComments));
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
      <LoadingOverlay
        message="Carregando tabela de classificação..."
      />
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
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

          {/* Export Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => refinement && exportToPDF(refinement, teamMetrics, sortedData, allCards)}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF
            </button>
            <button
              onClick={() => refinement && exportToDOC(refinement, teamMetrics, sortedData, allCards)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar DOC
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-all duration-200 ${activeTab === 'participants'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              👥 Participantes
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-all duration-200 ${activeTab === 'teams'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              🏆 Times
            </button>
          </div>

          {activeTab === 'participants' && refinement &&
            <MembersLeaderboard
              refinement={refinement}
              sortedData={sortedData}
              allCards={allCards}
              sortBy={sortBy}
              setSortBy={setSortBy}
              setSelectedUser={setSelectedUser}
              setIsModalOpen={setIsModalOpen}
            />}

          {activeTab === 'teams' && <TeamLeaderboard
            teamMetrics={teamMetrics}
            expandedTeams={expandedTeams}
            allCards={allCards}
            setSelectedUser={setSelectedUser}
            setIsModalOpen={setIsModalOpen}
            setExpandedTeams={setExpandedTeams}
          />}

          {/* Refresh Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => refinementId && loadLeaderboardData(refinementId)}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              Atualizar Tabela
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Contribuições do Usuário */}
      {isModalOpen && selectedUser &&
        <ContributionsModal
          refinement={refinement}
          selectedUser={selectedUser}
          sortedData={sortedData}
          setIsModalOpen={setIsModalOpen}
          setSelectedUser={setSelectedUser}
        />}
    </div>
  );
};

export default LeaderboardScene;