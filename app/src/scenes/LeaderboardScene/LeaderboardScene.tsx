import React, { useEffect, useState } from 'react';
import type { LeaderboardSortTypes, TabType, TeamMetrics, UserContributions, UserStats } from '../../types/leaderboard';
import { useNavigate, useParams } from 'react-router-dom';
import type { Session, Card } from '../../types/global';
import { getAvailableTeams } from '../../services/teamSelectionServices';
import { exportToDOC, exportToPDF } from '../../services/leaderboardServices';
import TeamLeaderboard from './components/TeamLeaderboard';
import MembersLeaderboard from './components/MembersLeaderboard';
import ContributionsModal from './components/ContributionsModal';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { getCardsBySessionId } from '@/services/firestore/cardServices';
import { fetchLeaderboardData } from '@/services/firestore/firestoreServices';
import { getSession } from '@/services/firestore/sessionServices';
import { Trophy, Download, Users, TrendingUp, RefreshCw, ChevronLeft, Home, FileText, BarChart3, Shield, MessageSquare } from 'lucide-react';
import CollapsibleDescriptionArea from '@/components/CollapsibleDescriptionArea';
import { Button } from '@/components/Button';
import { calculateUserGamificationPoints, calculateTotalScore } from '@/services/gamificationServices';
import ScoreExplanationFooter from './components/ScoreExplanationFooter';

const LeaderboardScene: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [leaderboardData, setLeaderboardData] = useState<UserStats[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<LeaderboardSortTypes>('score');
  const [activeTab, setActiveTab] = useState<TabType>('participants');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserContributions | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) return;
    loadLeaderboardData(sessionId);
  }, [sessionId]);

  const loadLeaderboardData = async (sessionId: string) => {
    setLoading(true);
    try {
      const [fetchedLeaderboardData, sessionData, cardsData] = await Promise.all([
        fetchLeaderboardData(sessionId),
        getSession(sessionId),
        getCardsBySessionId(sessionId)
      ]);

      const enrichedData = fetchedLeaderboardData.map(user => {
        const gamificationPoints = calculateUserGamificationPoints(cardsData, user.userId);
        const totalScore = calculateTotalScore(gamificationPoints);

        return {
          ...user,
          gamificationPoints,
          totalScore
        };
      });

      setLeaderboardData(enrichedData);
      setSession(sessionData);
      setAllCards(cardsData);
      calculateTeamMetrics(enrichedData, sessionData, cardsData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamMetrics = (users: UserStats[], sessionData: Session | null, cards: Card[]) => {
    if (!sessionData || !sessionData.teams) {
      setTeamMetrics([]);
      return;
    }

    const teams = getAvailableTeams(sessionData.numOfTeams || 2);
    const metrics: TeamMetrics[] = [];

    teams.forEach(teamName => {
      const teamMembers = users.filter(user =>
        sessionData.teams && sessionData.teams[user.userId] === teamName
      );

      const teamCards = cards.filter(card => card.teamName === teamName);

      const teamMetric: TeamMetrics = {
        teamName,
        members: teamMembers.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)),
        totalComments: teamMembers.reduce((sum, user) => sum + user.totalComments, 0),
        totalCards: teamCards.length,
        totalReplies: teamMembers.reduce((sum, user) => sum + user.totalReplies, 0),
        averageRating: teamMembers.length > 0
          ? Number((teamMembers.reduce((sum, user) => sum + user.averageRating, 0) / teamMembers.length).toFixed(1))
          : 0,
        totalMembers: teamMembers.length,
        totalScore: teamMembers.reduce((sum, user) => sum + (user.totalScore || 0), 0)
      };

      metrics.push(teamMetric);
    });

    setTeamMetrics(metrics.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)));
  };

  const sortedData = [...leaderboardData].sort((a, b) => {
    switch (sortBy) {
      case 'score': return (b.totalScore || 0) - (a.totalScore || 0);
      case 'comments': return b.totalComments - a.totalComments;
      case 'rating': return b.averageRating - a.averageRating;
      case 'replies': return b.totalReplies - a.totalReplies;
      case 'cards': return b.totalCardsCreated - a.totalCardsCreated;
      default: return 0;
    }
  });

  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <LoadingOverlay
        message="Carregando tabela de classificação..."
      />
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sessão não encontrada</h2>
          <Button onClick={() => navigate('/')} variant="outline-primary">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const top3 = sortedData.slice(0, 3);
  const totalParticipants = sortedData.length;
  const totalComments = sortedData.reduce((sum, user) => sum + user.totalComments, 0);
  const totalCards = allCards.length;
  const averageScore = totalParticipants > 0
    ? Math.round(sortedData.reduce((sum, user) => sum + (user.totalScore || 0), 0) / totalParticipants)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Título e descrição */}
            <div className="flex-1">
              <div className="flex justify-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-gray-800">
                  Tabela de Classificação - {session.title}
                </h1>
              </div>

              {session.description && (
                <CollapsibleDescriptionArea
                  sessionDescription={session.description}
                  showDescription={showDescription}
                  setShowDescription={setShowDescription}
                />
              )}

              {/* Estatísticas de resumo */}
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
                <div className="flex justify-center items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-700">RESUMO DA COMPETIÇÃO</span>
                </div>
                <p className="text-gray-700 text-center">
                  Acompanhe o desempenho dos participantes e times nesta sessão de levantamento de requisitos.
                </p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleGoBack}
                variant="outline-secondary"
                className="flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => session && exportToPDF(session, teamMetrics, sortedData, allCards)}
                  variant="outline-danger"
                  className="flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Exportar PDF
                </Button>
                <Button
                  onClick={() => session && exportToDOC(session, teamMetrics, sortedData, allCards)}
                  variant="outline-primary"
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar DOC
                </Button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-700" />
                <div className="text-2xl font-bold text-blue-700">{totalParticipants}</div>
              </div>
              <div className="text-sm font-medium text-blue-800">Participantes</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-green-700" />
                <div className="text-2xl font-bold text-green-700">{totalCards}</div>
              </div>
              <div className="text-sm font-medium text-green-800">Sugestões</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-purple-700" />
                <div className="text-2xl font-bold text-purple-700">{totalComments}</div>
              </div>
              <div className="text-sm font-medium text-purple-800">Comentários</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-700" />
                <div className="text-2xl font-bold text-yellow-700">{averageScore}</div>
              </div>
              <div className="text-sm font-medium text-yellow-800">Pontuação Média</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Classificação Geral
                <span className="text-sm font-normal text-gray-500">
                  ({sortedData.length} participantes)
                </span>
              </h2>
              <p className="text-sm text-gray-600 text-start mt-1">
                Visualize o ranking por pontuação total ou outras métricas
              </p>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => sessionId && loadLeaderboardData(sessionId)}
                variant="secondary"
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Top 3 */}
          {top3.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {top3.map((user, index) => (
                <div key={user.userId} className={`p-6 rounded-xl border-2 ${index === 0
                  ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100'
                  : index === 1
                    ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100'
                    : 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100'
                  }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0
                        ? 'bg-yellow-500 text-white'
                        : index === 1
                          ? 'bg-gray-500 text-white'
                          : 'bg-orange-500 text-white'
                        }`}>
                        <span className="text-lg font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{user.userName}</h3>
                        <p className="text-sm text-gray-600">
                          {session?.teams?.[user.userId] || 'Sem time'}
                        </p>
                      </div>
                    </div>
                    {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                    {index === 1 && <Trophy className="w-6 h-6 text-gray-500" />}
                    {index === 2 && <Trophy className="w-6 h-6 text-orange-500" />}
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{user.totalScore || 0}</div>
                    <div className="text-sm text-gray-600">pontos totais</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'participants'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Users className="w-5 h-5" />
              Participantes
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'teams'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Shield className="w-5 h-5" />
              Times
            </button>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="mb-6">
          {activeTab === 'participants' && session && (
            <MembersLeaderboard
              session={session}
              sortedData={sortedData}
              allCards={allCards}
              sortBy={sortBy}
              setSortBy={setSortBy}
              setSelectedUser={setSelectedUser}
              setIsModalOpen={setIsModalOpen}
            />
          )}

          {activeTab === 'teams' && (
            <TeamLeaderboard
              teamMetrics={teamMetrics}
              expandedTeams={expandedTeams}
              allCards={allCards}
              setSelectedUser={setSelectedUser}
              setIsModalOpen={setIsModalOpen}
              setExpandedTeams={setExpandedTeams}
            />
          )}
        </div>

        {/* Footer com informações */}
        <ScoreExplanationFooter
          loadLeaderboardData={loadLeaderboardData}
          sessionId={sessionId || ''}
          handleGoBack={handleGoBack}
        />
      </div>

      {/* Modal de Contribuições do Usuário */}
      {isModalOpen && selectedUser &&
        <ContributionsModal
          session={session}
          selectedUser={selectedUser}
          sortedData={sortedData}
          setIsModalOpen={setIsModalOpen}
          setSelectedUser={setSelectedUser}
        />}
    </div>
  );
};

export default LeaderboardScene;