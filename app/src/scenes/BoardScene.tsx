import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BoardCard from '../components/BoardCard';
import { useUser } from '../components/UserContext';
import { createUnsubscribeCards, createUnsubscribeRefinement } from '../hooks/firestoreUnsubscriber';
import { addCommentToCardInFirestore, createCardInFirestore, getRefinement, updateCardInFirestore, updateCommentToCardInFirestore, updateRatingToCardInFirestore } from '../services/firestoreService';
import type { Card, Refinement } from '../types/global';
import { getNextTeam } from '../services/boardService';
import { getAvailableTeams } from '../services/teamSelectionService';
import VariableTextArea from "../components/VariableTextArea";
import SyncTimer from '../components/SyncTimer';
import { returnTimerId } from '../services/globalServices';
import CollapsibleDescriptionArea from '../components/CollapsibleDescriptionArea';

const BoardScene: React.FC = () => {
  const { refinementId, teamName } = useParams<{ refinementId: string, teamName: string }>();
  const { user } = useUser();
  const [refinement, setRefinement] = useState<Refinement>({} as Refinement);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [_myTeam, setMyTeam] = useState<string>('');
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardText, setNewCardText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!refinementId) return;

    let unsubscribeRefinement: (() => void) | undefined;
    let unsubscribeCards: (() => void) | undefined;

    const fetchData = async () => {
      setLoading(true);
      try {
        const refinementData = await getRefinement(refinementId);
        if (refinementData) {
          setRefinement(refinementData);
          setAvailableTeams(getAvailableTeams(refinementData.numOfTeams || 2));
        }

        unsubscribeRefinement = createUnsubscribeRefinement(refinementId, setRefinement);
        unsubscribeCards = createUnsubscribeCards(refinementId, setCards);
      } catch (error) {
        console.error('Error loading refinement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeRefinement) unsubscribeRefinement();
      if (unsubscribeCards) unsubscribeCards();
    };
  }, [refinementId]);

  useEffect(() => {
    if (refinementId && refinement.teams) {
      setMyTeam(refinement.teams[user.id] || '');
      setAvailableTeams(getAvailableTeams(refinement.numOfTeams || 2));
    }
  }, [refinementId, refinement.teams, user.id, refinement.numOfTeams]);

  const handleChangeBoard = () => {
    if (!refinementId || !teamName) return;
    const nextTeam = getNextTeam(teamName, availableTeams);
    navigate(`/board/${refinementId}/team/${nextTeam}`);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (_.isEmpty(user)) {
    navigate('/name-entry');
    return null;
  }

  const teamTimerId = returnTimerId(teamName, refinement);

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
                <span>Participante: <strong>{user.name}</strong></span>
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
                handleSubmit={() =>
                  createCardInFirestore(
                    newCardText,
                    refinementId,
                    user,
                    teamName,
                    setNewCardText
                  )
                }
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleChangeBoard}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                title="Mudar para outro time"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Mudar Time
              </button>

              <button
                onClick={handleGoBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Sugestões do Time {teamName}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({cards.filter(card => card.teamName === teamName).length} sugestões)
            </span>
          </h3>

          {cards.filter(card => card.teamName === teamName).length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards
                .filter(card => card.teamName === teamName)
                .map(card => (
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