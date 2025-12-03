import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BoardCard from './components/BoardCard';
import { CardSkeleton } from './components/CardSkeleton';
import { createUnsubscribeCards, createUnsubscribeSession } from '../../hooks/firestoreUnsubscriber';
import { addCommentToCardInFirestore, createCardInFirestore, getSession, updateCardInFirestore, updateCommentToCardInFirestore, updateRatingToCardInFirestore } from '../../services/firestore/firestoreServices';
import type { Card, Session } from '../../types/global';
import { getSortedCards } from '../../services/boardServices';
import VariableTextArea from "../../components/VariableTextArea";
import { returnTimerId } from '../../services/globalServices';
import CollapsibleDescriptionArea from '../../components/CollapsibleDescriptionArea';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import SyncTimer from './components/SyncTimer';
import CardSortingSelector, { SortOption } from './components/CardSorteningSelector';
import MasonryGrid from '@/components/MasonryGrid';
import {
  Clock,
  FileText,
  LogOut,
  Users,
  Eye,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  Star,
  Ban
} from 'lucide-react';

const BoardScene: React.FC = () => {
  const { sessionId, teamName } = useParams<{ sessionId: string, teamName: string }>();
  const { user } = useAuth();
  const [session, setSession] = useState<Session>({} as Session);
  const [_myTeam, setMyTeam] = useState<string>('');
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardText, setNewCardText] = useState('');
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [timeEnded, setTimeEnded] = useState<boolean>(false);
  const [showAnonymousReview, setShowAnonymousReview] = useState<boolean>(false);
  const [timerLoaded, setTimerLoaded] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const navigate = useNavigate();

  const handleTimerLoaded = () => {
    setTimerLoaded(true);
  };

  const handleTimerStateChange = (hasEnded: boolean) => {
    if (session.isClosed) {
      setTimeEnded(true);
      setShowAnonymousReview(true);
      return;
    }

    setTimeEnded(hasEnded);
    if (hasEnded) {
      setShowAnonymousReview(true);
    } else {
      setShowAnonymousReview(false);
    }
  };

  const handleTimeEnd = () => {
    setTimeEnded(true);
    setShowAnonymousReview(true);
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
          setTimeEnded(sessionData.isClosed || false);
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
    }
  }, [sessionId, session.teams, user, session.numOfTeams]);

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
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
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
              <div className="flex justify-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  {session.title}
                </h1>
              </div>
              {session.description && (
                <CollapsibleDescriptionArea
                  sessionDescription={session.description}
                  showDescription={showDescription}
                  setShowDescription={setShowDescription}
                />
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{teamName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Participante:</span>
                  <span className="font-semibold">{user.displayName}</span>
                </div>
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
                  isSessionClosed={session.isClosed}
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
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Adicionar Nova Sugestão
                  </h2>
                </div>
                <VariableTextArea
                  text={newCardText}
                  setText={setNewCardText}
                  handleSubmit={handleCreateCard}
                  disabled={isCreatingCard}
                  placeholder={isCreatingCard ? "Criando sugestão..." : "Digite sua sugestão..."}
                  rows={2}
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
                  variant="outline-secondary"
                  className="flex items-center justify-center gap-2 border-red-500 hover:border-red-600 text-red-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-red-50 to-red-50 border border-red-200 rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center">
              {session.isClosed ? (<>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Ban className="w-8 h-8 text-red-600" />
                  <h2 className="text-2xl font-bold text-red-800">
                    Sessão Encerrada!
                  </h2>
                </div>
                <p className="text-red-700 mb-4">
                  A sessão foi encerrada.
                </p>
              </>) : (
                <>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="w-8 h-8 text-yellow-600" />
                    <h2 className="text-2xl font-bold text-yellow-800">
                      Tempo Esgotado!
                    </h2>
                  </div>
                  <p className="text-yellow-700 mb-4">
                    A fase de sugestões e votos foi encerrada.
                  </p>
                </>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {showAnonymousReview && (
                  <Button
                    onClick={() => navigate(`/review/${sessionId}`)}
                    variant="primary"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Eye className="w-4 h-4" />
                    Revisão Anônima
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
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-6 h-6 text-gray-700" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Sugestões do {teamName}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({teamCards.length} sugestões)
                  </span>
                </h3>
              </div>
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
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma sugestão ainda</h3>
              <p className="text-gray-500 mb-6">Seja o primeiro a adicionar uma sugestão!</p>
              {!timeEnded && isUserInTeam && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm">Use o formulário acima para começar</span>
                </div>
              )}
            </div>
          ) : (
            // Cards carregados e ordenados
            <MasonryGrid
              columns={{ sm: 1, md: 2, lg: 3 }}
              gap={24}
              className="p-2"
            >
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
            </MasonryGrid>
          )}
        </div>

        {/* Footer com ações */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end items-center">
          <div className="flex gap-3">
            <Button
              onClick={handleGoBack}
              variant="outline-primary"
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </Button>
            {showAnonymousReview && (
              <Button
                onClick={() => navigate(`/review/${sessionId}`)}
                variant="primary"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Eye className="w-4 h-4" />
                Revisão Anônima
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardScene;