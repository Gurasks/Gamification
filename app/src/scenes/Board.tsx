import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BoardCard from '../components/BoardCard';
import { useUser } from '../components/UserContext';
import { createUnsubscribeCards, createUnsubscribeRefinement } from '../hooks/firestoreUnsubscriber';
import { addCommentToCardInFirestore, createCardInFirestore, loadRefinementWithId, updateCardInFirestore, updateCommentToCardInFirestore, updateRatingToCardInFirestore } from '../services/firestoreService';
import type { Card, Refinement } from '../types/global';
import { getNextTeam } from '../services/boardService';
import { getAvailableTeams } from '../services/teamSelectionService';
import VariableTextArea from "../components/VariableTextArea";
import SyncTimer from '../components/SyncTimer';
import { returnTimerId } from '../services/globalServices';



const Board: React.FC = () => {
  const { refinementId, teamName } = useParams<{ refinementId: string, teamName: string }>();
  const { user } = useUser();
  const [refinement, setRefinement] = useState<Refinement>({} as Refinement);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [_myTeam, setMyTeam] = useState<string>('');
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardText, setNewCardText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!refinementId) return;

    let unsubscribeRefinement: (() => void) | undefined;
    let unsubscribeCards: (() => void) | undefined;

    const fetchData = async () => {
      await loadRefinementWithId(refinementId, setRefinement);
      setAvailableTeams(getAvailableTeams(refinement.numOfTeams || 2));
      unsubscribeRefinement = createUnsubscribeRefinement(refinementId, setRefinement);
      unsubscribeCards = createUnsubscribeCards(refinementId, setCards);
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
  }


  if (!refinement) return <div className="p-4">Carregando refinamento...</div>;

  if (_.isEmpty(user)) {
    navigate('/name-entry');
    return <div>Redirecionando para tela de identificação...</div>;
  }

  const teamTimerId = returnTimerId(teamName, refinement)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{refinement.title}</h1>
        {refinement.hasStarted && teamTimerId && (
          <SyncTimer timerId={teamTimerId} />
        )}
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleChangeBoard}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Mudar times"
        >
          Mudar times
        </button>

      </div>
      <div className='mt-4 mb-6'>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{teamName} - {user.name}</h2>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              }} />
          ))}
      </div>
    </div>
  );
};

export default Board;