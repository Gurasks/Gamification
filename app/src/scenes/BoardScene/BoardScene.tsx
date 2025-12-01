import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BoardCard from './components/BoardCard';
import { CardSkeleton } from './components/CardSkeleton';
import { createUnsubscribeCards, createUnsubscribeSession } from '../../hooks/firestoreUnsubscriber';
import { addCommentToCardInFirestore, createCardInFirestore, getSession, updateCardInFirestore, updateCommentToCardInFirestore, updateRatingToCardInFirestore } from '../../services/firestore/firestoreServices';
import type { Card, Session } from '../../types/global';
import { getNextTeam, getSortedCards } from '../../services/boardServices';
import { getAvailableTeams } from '../../services/teamSelectionServices';
import VariableTextArea from "../../components/VariableTextArea";
import { returnTimerId } from '../../services/globalServices';
import CollapsibleDescriptionArea from '../../components/CollapsibleDescriptionArea';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import SyncTimer from './components/SyncTimer';
import toast from 'react-hot-toast';
import CardSortingSelector, { SortOption } from './components/CardSorteningSelector';

const BoardScene: React.FC = () => {
  const { sessionId, teamName } = useParams<{ sessionId: string, teamName: string }>();
  const { user } = useAuth();
  const [session, setSession] = useState<Session>({} as Session);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [_myTeam, setMyTeam] = useState<string>('');
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardText, setNewCardText] = useState('');
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [isChangingTeam, setIsChangingTeam] = useState(false);
  const [timeEnded, setTimeEnded] = useState<boolean>(false);
  const [showLeaderboardButton, setShowLeaderboardButton] = useState<boolean>(false);
  const [timerLoaded, setTimerLoaded] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const navigate = useNavigate();

  const handleTimerLoaded = () => {
    setTimerLoaded(true);
  };

  const handleTimerStateChange = (hasEnded: boolean) => {
    setTimeEnded(hasEnded);
    if (hasEnded) {
      setShowLeaderboardButton(true);
    }
  };

  const handleTimeEnd = () => {
    setTimeEnded(true);
    setShowLeaderboardButton(true);
  };

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!timerLoaded && session.hasStarted) {
        console.log('Safety timeout - marcando timer como carregado');
        setTimerLoaded(true);
      }
    }, 5000);

    return () => clearTimeout(safetyTimeout);
  }, [timerLoaded, session.hasStarted])

  useEffect(() => {
    if (!sessionId || !user) return;

    let unsubscribeSession: (() => void) | undefined;
    let unsubscribeCards: (() => void) | undefined;

    const fetchData = async () => {
      setLoading(true);
      setCardsLoading(true);

      try {
        const sessionData = await getSession(sessionId);
        if (sessionData) {
          setSession(sessionData);
          setAvailableTeams(getAvailableTeams(sessionData.numOfTeams || 2));
        }

        unsubscribeSession = createUnsubscribeSession(sessionId, setSession);
        unsubscribeCards = createUnsubscribeCards(sessionId, (newCards) => {
          setCards(newCards);
          setCardsLoading(false);
        });
      } catch (error) {
        console.error('Error loading session:', error);
        setCardsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeSession) unsubscribeSession();
      if (unsubscribeCards) unsubscribeCards();
    };
  }, [sessionId, user]);

  useEffect(() => {
    if (sessionId && session.teams && user) {
      setMyTeam(session.teams[user.uid] || '');
      setAvailableTeams(getAvailableTeams(session.numOfTeams || 2));
    }
  }, [sessionId, session.teams, user, session.numOfTeams]);

  useEffect(() => {
    setIsChangingTeam(false);
  }, [sessionId, teamName]);

  useEffect(() => {
    return () => {
      setIsChangingTeam(false);
    };
  }, []);

  const handleChangeBoard = async () => {
    if (!sessionId || !teamName || !availableTeams.length) {
      setIsChangingTeam(false);
      return;
    }

    setIsChangingTeam(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const nextTeam = getNextTeam(teamName, availableTeams);

      if (nextTeam && nextTeam !== teamName) {
        navigate(`/board/${sessionId}/team/${nextTeam}`);
      } else {
        console.error('Próximo time inválido:', nextTeam);
        toast.error('Erro ao mudar de time');
      }
    } catch (error) {
      console.error('Error changing team:', error);
      toast.error('Erro ao mudar de time');
    } finally {
      setIsChangingTeam(false);
    }
  };

  const handleCreateCard = async () => {
    if (!newCardText.trim() || isCreatingCard) return;

    setIsCreatingCard(true);

    try {
      if (!user) {
        console.error('Usuário não autenticado');
        navigate('/name-entry');
        return;
      }

      await createCardInFirestore(
        newCardText,
        sessionId,
        user,
        teamName,
        setNewCardText
      );
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setIsCreatingCard(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <LoadingOverlay
        message="Carregando sessão..."
      />
    );
  }

  if (!session || !session.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sessão não encontrada</h2>
          <Button
            onClick={handleGoBack}
            variant="primary"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  if (_.isEmpty(user)) {
    navigate('/name-entry');
    return null;
  }

  const teamTimerId = returnTimerId(teamName, session);
  const teamCards = cards.filter(card => card.teamName === teamName);
  const userTeam = session.teams[user.uid];
  const isUserInTeam = userTeam === teamName;
  const sortedTeamCards = getSortedCards(teamCards, sortBy);

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {session.title}
              </h1>
              {session.description && (
                <CollapsibleDescriptionArea
                  sessionDescription={session.description}
                  showDescription={showDescription}
                  setShowDescription={setShowDescription}
                />
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span><strong>{teamName}</strong></span>
                <span>Participante: <strong>{user.displayName}</strong></span>
              </div>
            </div>

            {session.hasStarted && teamTimerId && teamName && (
              <div className="flex-shrink-0">
                <SyncTimer
                  timerId={teamTimerId}
                  user={user}
                  currentTeam={teamName}
                  sessionTeams={session.teams || {}}
                  onTimeEnd={handleTimeEnd}
                  onTimerStateChange={handleTimerStateChange}
                  onTimerLoaded={handleTimerLoaded}
                />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        {!timeEnded && isUserInTeam ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Adicionar Nova Sugestão
                </h2>
                <VariableTextArea
                  text={newCardText}
                  setText={setNewCardText}
                  handleSubmit={handleCreateCard}
                  disabled={isCreatingCard}
                  placeholder={isCreatingCard ? "Criando sugestão..." : "Digite sua sugestão..."}
                />
                {isCreatingCard && (
                  <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm">
                    <LoadingSpinner size="sm" />
                    <span>Criando sugestão...</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGoBack}
                  variant="secondary"
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center">
              {isUserInTeam ? (
                <>
                  <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                    ⏰ Tempo Esgotado!
                  </h2>
                  <p className="text-yellow-700 mb-4">
                    A fase de sugestões e votos foi encerrada.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                    ⚠️ Seu time é o <strong>{userTeam || 'Não definido'}</strong>:
                  </h2>
                  <p className="text-yellow-700 mb-4">
                    Apenas membros do <strong>{teamName}</strong> podem adicionar sugestões e votar
                  </p>
                </>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={handleChangeBoard}
                  loading={isChangingTeam}
                  disabled={isChangingTeam || !sessionId || !teamName || availableTeams.length === 0}
                  variant="primary"
                  className="flex items-center gap-2"
                  title={availableTeams.length === 0 ? "Nenhum time disponível" : "Mudar para outro time"}
                  data-testid="change-team-button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Mudar Time
                </Button>

                {showLeaderboardButton && (
                  <Button
                    onClick={() => navigate(`/leaderboard/${sessionId}`)}
                    variant="primary"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    📊 Ver tabela de classificação
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="w-full">
              <h3 className="text-xl font-semibold text-gray-800">
                Sugestões do {teamName}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({teamCards.length} sugestões)
                </span>
              </h3>
              {teamCards.length > 0 && !cardsLoading && (
                <div>
                  <CardSortingSelector
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
                </div>
              )}
            </div>

            {/* Loading indicator para cards */}
            {cardsLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <LoadingSpinner size="sm" />
                <span>Carregando...</span>
              </div>
            )}
          </div>

          {/* Estado de loading dos cards */}
          {cardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : teamCards.length === 0 ? (
            // Estado vazio
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">Nenhuma sugestão ainda</p>
              <p className="text-gray-400 text-sm">Seja o primeiro a adicionar uma sugestão!</p>
            </div>
          ) : (
            // Cards carregados e ordenados
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTeamCards.map(card => (
                <BoardCard
                  key={card.id}
                  card={card}
                  user={user}
                  handleRate={(cardId, rating) => {
                    if (!timeEnded) {
                      updateRatingToCardInFirestore(cardId, rating, user);
                    }
                  }}
                  onEdit={async (cardId, newText) => {
                    if (!timeEnded) {
                      await updateCardInFirestore(cardId, newText);
                    }
                  }}
                  onComment={async (cardId, commentText) => {
                    if (!timeEnded) {
                      await addCommentToCardInFirestore(cardId, commentText, user);
                    }
                  }}
                  onCommentEdit={async (cardId, commentId, commentText) => {
                    if (!timeEnded) {
                      await updateCommentToCardInFirestore(cardId, commentId, commentText);
                    }
                  }}
                  timeEnded={timeEnded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardScene;