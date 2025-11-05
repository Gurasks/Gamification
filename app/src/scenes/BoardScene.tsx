import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BoardCard from '../components/BoardCard';
import { CardSkeleton } from '../components/CardSkeleton';
import { createUnsubscribeCards, createUnsubscribeRefinement } from '../hooks/firestoreUnsubscriber';
import { addCommentToCardInFirestore, createCardInFirestore, getRefinement, updateCardInFirestore, updateCommentToCardInFirestore, updateRatingToCardInFirestore } from '../services/firestore/firestoreServices';
import type { Card, Refinement } from '../types/global';
import { getNextTeam } from '../services/boardServices';
import { getAvailableTeams } from '../services/teamSelectionServices';
import VariableTextArea from "../components/VariableTextArea";
import SyncTimer from '../components/SyncTimer';
import { returnTimerId } from '../services/globalServices';
import CollapsibleDescriptionArea from '../components/CollapsibleDescriptionArea';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/Button';
import { useAuth } from '@/contexts/AuthContext';

const BoardScene: React.FC = () => {
  const { refinementId, teamName } = useParams<{ refinementId: string, teamName: string }>();
  const { user } = useAuth();
  const [refinement, setRefinement] = useState<Refinement>({} as Refinement);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [_myTeam, setMyTeam] = useState<string>('');
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardText, setNewCardText] = useState('');
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [isChangingTeam, setIsChangingTeam] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!refinementId || !user) return;

    let unsubscribeRefinement: (() => void) | undefined;
    let unsubscribeCards: (() => void) | undefined;

    const fetchData = async () => {
      setLoading(true);
      setCardsLoading(true);

      try {
        const refinementData = await getRefinement(refinementId);
        if (refinementData) {
          setRefinement(refinementData);
          setAvailableTeams(getAvailableTeams(refinementData.numOfTeams || 2));
        }

        unsubscribeRefinement = createUnsubscribeRefinement(refinementId, setRefinement);
        unsubscribeCards = createUnsubscribeCards(refinementId, (newCards) => {
          setCards(newCards);
          setCardsLoading(false);
        });
      } catch (error) {
        console.error('Error loading refinement:', error);
        setCardsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeRefinement) unsubscribeRefinement();
      if (unsubscribeCards) unsubscribeCards();
    };
  }, [refinementId, user]);

  useEffect(() => {
    if (refinementId && refinement.teams && user) {
      setMyTeam(refinement.teams[user.uid] || '');
      setAvailableTeams(getAvailableTeams(refinement.numOfTeams || 2));
    }
  }, [refinementId, refinement.teams, user, refinement.numOfTeams]);

  const handleChangeBoard = async () => {
    if (!refinementId || !teamName) return;

    setIsChangingTeam(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const nextTeam = getNextTeam(teamName, availableTeams);
    navigate(`/board/${refinementId}/team/${nextTeam}`);
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
        refinementId,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  if (!refinement || !refinement.id) {
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

  const teamTimerId = returnTimerId(teamName, refinement);
  const teamCards = cards.filter(card => card.teamName === teamName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {refinement.title}
              </h1>
              {refinement.description && (
                <CollapsibleDescriptionArea
                  refinementDescription={refinement.description}
                  showDescription={showDescription}
                  setShowDescription={setShowDescription}
                />
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Time: <strong>{teamName}</strong></span>
                <span>Participante: <strong>{user.displayName}</strong></span>
              </div>
            </div>

            {refinement.hasStarted && teamTimerId && (
              <div className="flex-shrink-0">
                <SyncTimer timerId={teamTimerId} />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
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

              {/* Loading para criar card */}
              {isCreatingCard && (
                <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm">
                  <LoadingSpinner size="sm" />
                  <span>Criando sugestão...</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleChangeBoard}
                loading={isChangingTeam}
                variant="primary"
                className="flex items-center gap-2"
                title="Mudar para outro time"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Mudar Time
              </Button>

              <Button
                onClick={handleGoBack}
                variant="secondary"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Sugestões do Time {teamName}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({teamCards.length} sugestões)
              </span>
            </h3>

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
            // Cards carregados
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamCards.map(card => (
                <BoardCard
                  key={card.id}
                  card={card}
                  user={user}
                  handleRate={(cardId, rating) => {
                    updateRatingToCardInFirestore(cardId, rating, user);
                  }}
                  onEdit={async (cardId, newText) => {
                    await updateCardInFirestore(cardId, newText);
                  }}
                  onComment={async (cardId, commentText) => {
                    await addCommentToCardInFirestore(cardId, commentText, user);
                  }}
                  onCommentEdit={async (cardId, commentId, commentText) => {
                    await updateCommentToCardInFirestore(cardId, commentId, commentText);
                  }}
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