import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '../components/UserContext';
import _ from 'lodash';
import { createRefinementInFirestore, updateDocumentListMembers } from '../services/firestoreService';


const Home: React.FC = () => {
  const { user } = useUser();
  const [refinementId, setRefinementId] = useState('');
  const [newRefinementName, setNewRefinementName] = useState('');
  const navigate = useNavigate();

  const handleJoinRefinement = async () => {
    if (refinementId) {
      const response = await updateDocumentListMembers(refinementId, user);
      if (!response) {
        console.error('Failed to join refinement');
        return;
      } else if (response === 'inRefinement' || response === 'success') {
        console.log('User already exists in the refinement');
        navigate(`/team-selection/${refinementId}`);
      }
    };
  }

  const handleCreateRefinement = async () => {
    const newRefinementId = uuidv4();
    const docId = createRefinementInFirestore(newRefinementId, newRefinementName, user);
    if (!docId) {
      console.error('Failed to create refinement');
      return;
    }
    navigate(`/team-selection/${newRefinementId}`);
  };

  useEffect(() => {
    if (_.isEmpty(user)) {
      navigate('/name-entry');
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto mt-16 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Bem vindo, {user.name}
      </h1>

      <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Participar de um refinamento</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="ID do refinamento"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={refinementId}
            onChange={(e) => setRefinementId(e.target.value)}
          />
          <button
            onClick={handleJoinRefinement}
            disabled={!refinementId}
            className={`w-full py-2 px-4 rounded-md shadow-sm text-white ${!refinementId ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            Participar
          </button>
        </div>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Criar novo refinamento</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome do Refinamento"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={newRefinementName}
            onChange={(e) => setNewRefinementName(e.target.value)}
          />
          <button
            onClick={handleCreateRefinement}
            disabled={!newRefinementName}
            className={`w-full py-2 px-4 rounded-md shadow-sm text-white ${!newRefinementName ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;