import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import _ from 'lodash';
import type { Refinement, Card } from '../types/global';
import BoardCard from '../components/BoardCard';
import Timer from '../components/Timer';


const Board: React.FC = () => {
  const { refinementId, teamName } = useParams<{ refinementId: string, teamName: string }>();
  const { user } = useUser();
  const [refinement, setRefinement] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardText, setNewCardText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!refinementId) return;

    const loadBoard = async () => {
      const refinementDoc = await getDoc(doc(db, 'refinements', refinementId));
      if (refinementDoc.exists()) {
        setRefinement(refinementDoc.data());
      }
    };

    loadBoard();

    const refinementQuery = query(collection(db, 'refinements'), where('refinementId', '==', refinementId));
    const unsubscribeColumns = onSnapshot(refinementQuery, (snapshot) => {
      const refinementDataArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Refinement[];
      if (refinementDataArray.length === 1) {
        setRefinement(refinementDataArray[0]);
      }
    });

    const cardsQuery = query(collection(db, 'cards'), where('refinementId', '==', refinementId));
    const unsubscribeCards = onSnapshot(cardsQuery, (snapshot) => {
      const crds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Card[];
      setCards(crds);
    });

    return () => {
      unsubscribeColumns();
      unsubscribeCards();
    };
  }, [refinementId]);

  const handleAddCard = async () => {
    if (!newCardText.trim() || _.isEmpty(user)) return;

    await addDoc(collection(db, 'cards'), {
      text: newCardText,
      refinementId,
      createdBy: user.name,
      teamName,
      votes: [],
      createdAt: new Date()
    });

    setNewCardText('');
  };

  const handleRate = async (cardId: string, rating: number) => {
    if (!user?.id) return;

    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, {
      [`ratings.${user.id}`]: rating
    });
  };

  if (!refinement) return <div className="p-4">Carregando refinamento...</div>;
  if (_.isEmpty(user)) {
    navigate('/name-entry');
    return <div>Redirecionando para tela de nome...</div>;
  }
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{refinement.title}</h1>
        <Timer initialMinutes={5} initialSeconds={0} />
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <div
          className="flex-1 p-4 border rounded-lg min-w-[250px] transition-colors bg-indigo-50 border-indigo-300"
        >
          <h2 className="text-lg font-semibold mb-3 text-gray-700">{teamName} - {user.name}</h2>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="Adicione uma sugestão..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={newCardText}
              onChange={(e) => setNewCardText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCard()}
            />
            <button
              onClick={handleAddCard}
              disabled={!newCardText.trim()}
              className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-700 sticky top-0 bg-white py-2 z-10">
            {teamName}
          </h3>
          {cards
            .filter(card => card.teamName === teamName)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map(card => (
              <BoardCard card={card} user={user} handleRate={handleRate} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Board;