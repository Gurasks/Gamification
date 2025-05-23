import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import _ from 'lodash';

interface Column {
  id: string;
  title: string;
  boardId: string;
  order: number;
}

interface RetroCard {
  id: string;
  text: string;
  columnId: string;
  boardId: string;
  createdBy: string;
  votes: string[]; // Array of user names who voted
  createdAt: Date;
}

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { user } = useUser();
  const [board, setBoard] = useState<any>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [newCardText, setNewCardText] = useState('');
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const loadBoard = async () => {
      const boardDoc = await getDoc(doc(db, 'boards', boardId));
      if (boardDoc.exists()) {
        setBoard(boardDoc.data());
      }
    };

    loadBoard();

    const columnsQuery = query(collection(db, 'columns'), where('boardId', '==', boardId));
    const unsubscribeColumns = onSnapshot(columnsQuery, (snapshot) => {
      const cols = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Column[];
      setColumns(cols.sort((a, b) => a.order - b.order));
    });

    const cardsQuery = query(collection(db, 'cards'), where('boardId', '==', boardId));
    const unsubscribeCards = onSnapshot(cardsQuery, (snapshot) => {
      const crds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as RetroCard[];
      setCards(crds);
    });

    return () => {
      unsubscribeColumns();
      unsubscribeCards();
    };
  }, [boardId]);

  const handleAddCard = async () => {
    if (!activeColumn || !newCardText.trim() || _.isEmpty(user)) return;

    await addDoc(collection(db, 'cards'), {
      text: newCardText,
      columnId: activeColumn,
      boardId,
      createdBy: user.name,
      votes: [],
      createdAt: new Date()
    });

    setNewCardText('');
  };

  const handleVote = async (cardId: string) => {
    if (_.isEmpty(user)) return;

    const cardRef = doc(db, 'cards', cardId);
    const card = cards.find(c => c.id === cardId);

    if (!card) return;

    const hasVoted = card.votes.includes(user.name);
    const newVotes = hasVoted
      ? card.votes.filter(name => name !== user.name)
      : [...card.votes, user.name];

    await updateDoc(cardRef, { votes: newVotes });
  };

  if (!board) return <div className="p-4">Loading board...</div>;
  if (_.isEmpty(user)) return <div>Redirecting to name entry...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{board.title}</h1>
        <div className="text-sm text-gray-600">Logged in as: {user.name}</div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {columns.map(column => (
          <div
            key={column.id}
            className={`flex-1 p-4 border rounded-lg min-w-[250px] transition-colors ${activeColumn === column.id
              ? 'bg-indigo-50 border-indigo-300'
              : 'bg-white border-gray-200 hover:border-indigo-200'
              }`}
            onClick={() => setActiveColumn(column.id)}
          >
            <h2 className="text-lg font-semibold mb-3 text-gray-700">{column.title}</h2>

            {activeColumn === column.id && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Add a card..."
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
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(column => (
          <div key={column.id} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-700 sticky top-0 bg-white py-2 z-10">
              {column.title}
            </h3>
            {cards
              .filter(card => card.columnId === column.id)
              .sort((a, b) => b.votes.length - a.votes.length || a.createdAt.getTime() - b.createdAt.getTime())
              .map(card => (
                <div
                  key={card.id}
                  className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:border-indigo-200 transition-colors"
                >
                  <p className="text-gray-800 mb-2">{card.text}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">- {card.createdBy}</p>
                    <button
                      onClick={() => handleVote(card.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${card.votes.includes(user.name)
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span>{card.votes.length}</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;