import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from './UserContext';
import type { PersistentUser } from './global-types';
import _ from 'lodash';

interface Refinement {
  id: string,
  title: string,
  owner: string,
  members: PersistentUser[],
  createdAt: Date,
}

const Home: React.FC = () => {
  const { user } = useUser();
  const [refinementId, setRefinementId] = useState('');
  const [newRefinementName, setNewRefinementName] = useState('');
  const navigate = useNavigate();

  async function updateDocumentListMembers(refinementId: string, user: PersistentUser) {
    const docRef = doc(db, 'refinements', refinementId);
    const refinementDoc = await getDoc(doc(db, 'refinements', refinementId));
    if (refinementDoc.exists()) {
      const refinementData = refinementDoc.data() as Refinement;
      const membersList = refinementData.members;
      const memberExists = membersList.find((member) => member.id === user.id);
      if (!memberExists) {
        membersList.push(user);
      }

      try {
        await updateDoc(docRef, {
          ...refinementData,
          members: membersList,
        });
        console.log("Document updated successfully");
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    } else {
      console.log(" Doccument doesn't exist!");
    }
  }

  ;

  const handleJoinRefinement = () => {
    if (refinementId) {
      updateDocumentListMembers(refinementId, user);
      navigate(`/team-selection/${refinementId}`);
    }
  };

  const handleCreateRefinement = async () => {
    const newRefinementId = uuidv4();
    await setDoc(doc(db, 'refinements', newRefinementId), {
      id: newRefinementId,
      title: newRefinementName,
      owner: user.id,
      members: [user],
      createdAt: new Date(),
    });

    navigate(`/team-selection/${newRefinementId}`);
  };

  // const handleCreateRefinement = async () => {
  //   const newBoardId = uuidv4();
  //   await setDoc(doc(db, 'boards', newBoardId), {
  //     title: newRefinementName,
  //     createdAt: new Date(),
  //   });

  //   // Create default columns
  //   const columns = [
  //     { title: "Went Well", order: 1 },
  //     { title: "To Improve", order: 2 },
  //     { title: "Action Items", order: 3 }
  //   ];

  //   for (const column of columns) {
  //     await addDoc(collection(db, 'columns'), {
  //       ...column,
  //       boardId: newBoardId
  //     });
  //   }

  //   navigate(`/board/${newBoardId}`);
  // };

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