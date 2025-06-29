import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BoardCard from '../components/BoardCard';
import Timer from '../components/Timer';
import { useUser } from '../components/UserContext';
import { createUnsubscribeCards, createUnsubscribeRefinement } from '../hooks/firestoreUnsubscriber';
import { addCommentToCardInFirestore, createCardInFirestore, loadRefinementWithId, updateCardInFirestore, updateCommentToCardInFirestore, updateRatingToCardInFirestore, updateTimerToRefinementInFirebase } from '../services/firestoreService';
import type { Card, Refinement, TimerInfo } from '../types/global';
import { calculateTimeLeft, getNextTeam } from '../services/boardService';
import CardCreation from '../components/CardCreation';
import { returnToastMessage } from '../services/globalServices';
import { getAvailableTeams } from '../services/teamSelectionService';


const Board: React.FC = () => {
  const { refinementId, teamName } = useParams<{ refinementId: string, teamName: string }>();
  const { user } = useUser();
  const [refinement, setRefinement] = useState<Refinement>({} as Refinement);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [myTeam, setMyTeam] = useState<string>('');
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardText, setNewCardText] = useState('');
  const [time, setTime] = useState({ minutes: 0, seconds: 0 } as TimerInfo);
  const navigate = useNavigate();

  useEffect(() => {
    if (!refinementId) return;

    loadRefinementWithId(refinementId, setRefinement);
    setAvailableTeams(getAvailableTeams(refinement.numOfTeams || 2));
    const unsubscribeRefinement = createUnsubscribeRefinement(refinementId, setRefinement);
    const unsubscribeCards = createUnsubscribeCards(refinementId, setCards);
    return () => {
      unsubscribeRefinement();
      unsubscribeCards();
    };
  }, [refinementId]);

  useEffect(() => {
    if (refinementId && refinement.teams) {
      setMyTeam(refinement.teams[user.id] || '');
      setAvailableTeams(getAvailableTeams(refinement.numOfTeams || 2));
    }
  }, [refinementId, refinement.teams, user.id, refinement.numOfTeams]);

  useEffect(() => {
    const { startTime, timerMinutes, timerSeconds } = refinement;

    if (
      refinementId &&
      startTime &&
      typeof timerMinutes === 'number' &&
      typeof timerSeconds === 'number'
    ) {
      setTime(calculateTimeLeft(startTime, timerMinutes, timerSeconds));
    }
  }, [refinementId, refinement.startTime]);

  const handleComplete = () => {
    returnToastMessage('Tempo esgotado!', 'timer');
    setTimerCompleted(true);
  };

  const handleAddMinute = () => {
    if (!refinementId) return;
    updateTimerToRefinementInFirebase(
      refinementId,
      { minutes: 1, seconds: 0 } as TimerInfo,
      setTime
    );
    setTimerCompleted(false);
  };

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{refinement.title}</h1>
        <Timer
          minutesLeft={time.minutes}
          secondsLeft={time.seconds}
          onComplete={handleComplete}
          onAddMinute={handleAddMinute}
        />
      </div>

      {myTeam === teamName && !timerCompleted && (
        <CardCreation
          user={user}
          refinementId={refinement.id}
          teamName={teamName || ''}
          newCardText={newCardText}
          setNewCardText={setNewCardText}
          createCard={createCardInFirestore}
        />)
      }

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleChangeBoard}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Mudar times"
        >
          Mudar times
        </button>
      </div>

      <h3 className="text-lg font-medium text-gray-700 sticky top-0 bg-white py-2 z-10">
        {teamName}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards
          .filter(card => card.teamName === teamName)
          // .sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime())
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