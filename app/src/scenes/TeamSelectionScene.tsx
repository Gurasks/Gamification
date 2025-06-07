import React, { useEffect, useState, type SetStateAction } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { PersistentUser, Refinement } from '../types/global';
import SelectionMethodChooser from '../components/SelectionMethodChooser';
import OwnerTeamAssignment from '../components/OwnerTeamAssignment';
import TeamSelection from '../components/TeamSelection';
import _ from 'lodash';
import type { SelectionMethod } from '../types/teamSelection';


const TeamSelectionScene: React.FC = () => {
  const { refinementId } = useParams<{ refinementId: string }>();
  const { user } = useUser();
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [members, setMembers] = useState<PersistentUser[]>([] as PersistentUser[]);
  const [numOfTeams, setNumOfTeams] = useState<number>(2);
  const [owner, setOwner] = useState<string>('');
  const [teamParticipants, setTeamParticipants] = useState<Record<string, string>>({});
  const [refinement, setRefinement] = useState<Refinement | null>(null);

  const navigate = useNavigate();

  const getAvailableTeams = (numOfTeams: number) => {
    const newAvailableTeams = [];
    for (let i = 0; i < numOfTeams; i++) {
      newAvailableTeams.push(`Time ${String.fromCharCode(65 + i)}`);
    }
    return newAvailableTeams;
  }

  const handleMethodChange = async (method: SelectionMethod) => {
    if (!refinementId) return;
    await updateDoc(doc(db, 'refinements', refinementId), {
      selectionMethod: method,
    });
  };

  const handleNumberChange = async (e: { target: { value: SetStateAction<string>; }; }) => {
    const newNumOfTeams = parseInt(e.target.value as string);
    if (!refinementId) return;
    await updateDoc(doc(db, 'refinements', refinementId), {
      numOfTeams: newNumOfTeams,
    });
    setAvailableTeams(getAvailableTeams(newNumOfTeams));
  }

  const handleStartRefinement = async () => {
    if (refinementId && refinement && _.size(refinement.teams) === refinement.members.length) {
      const teamName = refinement.teams[user.id];
      if (teamName) {
        await updateDoc(doc(db, 'refinements', refinementId), {
          hasStarted: true,
        });
        navigate(`/board/${refinementId}/team/${teamName}`);
      }
    }
  };

  useEffect(() => {
    if (!refinementId) return;

    const refinementQuery = query(collection(db, 'refinements'), where('id', '==', refinementId));
    const unsubscribeMembers = onSnapshot(refinementQuery, (snapshot) => {
      const refinementDataArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Refinement[];
      if (refinementDataArray.length === 1) {
        const refinementData = refinementDataArray[0];
        const teamName = refinementData.teams?.[user.id];
        if (refinementData.hasStarted) {
          if (teamName) {
            navigate(`/board/${refinementId}/team/${teamName}`);
          } else {
            navigate('/');
          }
        }
        setAvailableTeams(getAvailableTeams(refinementData.numOfTeams));
        setIsOwner(refinementData.owner === user.id);
        setMembers(refinementData.members as unknown as PersistentUser[]);
        setNumOfTeams(refinementData.numOfTeams);
        setOwner(refinementData.owner);
        setRefinement(refinementData);

      }
    });

    return () => {
      unsubscribeMembers();
    };
  }, []);

  useEffect(() => {
    if (refinement) setTeamParticipants(refinement.teams as unknown as Record<string, string>)
  }, [refinement]);

  return refinementId && refinement ? (
    <div className="app">
      <div>
        <h1>Quantidade de times</h1>
        {isOwner ? (
          <>
            <input
              className="text-5xl font-bold text-center my-1"
              name="teamNumbers"
              type='number'
              min="2"
              defaultValue={numOfTeams}
              onChange={handleNumberChange}
            />
            <SelectionMethodChooser
              currentMethod={refinement.selectionMethod || 'RANDOM'}
              onMethodChange={handleMethodChange}
              isOwner={isOwner}
            />
          </>
        ) :
          (
            <p className="text-5xl font-bold text-center my-1">{numOfTeams}</p>
          )
        }

        {refinement.selectionMethod === 'OWNER_CHOOSES' && isOwner ? (
          <OwnerTeamAssignment
            refinementId={refinementId}
            members={members}
            availableTeams={availableTeams}
            currentAssignments={refinement.teams || {}}
          />
        ) : (
          <TeamSelection
            refinementId={refinementId}
            selectionMethod={refinement.selectionMethod || 'RANDOM'}
            availableTeams={availableTeams}
            currentTeam={user ? refinement.teams?.[user.id] : undefined}
          />
        )}
        <h1 className="mt-1">Lista de participantes</h1>
        <div className="content">
          <ul>
            {members.length > 0 && members
              .map(member => (
                <li key={member.id} className={` mb-2 ${member.id === owner
                  ? 'text-rose-800'
                  : member.id === user.id ? 'text-teal-800' : 'text-gray-800'
                  }`}>{member.name} {teamParticipants && teamParticipants[member.id] ? (<span> -
                    <span className='text-orange-400 font-bold'> {teamParticipants[member.id]}</span>
                  </span>) : ''}</li>
              ))}
          </ul>
        </div>
        {user.id === owner ? (<button
          onClick={handleStartRefinement}
          disabled={user.id !== owner}
          className={`w-full py-2 px-4 rounded-md shadow-sm text-white ${refinementId ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          Começar
        </button>) : null}
      </div>
    </div>
  ) : null;
};

export default TeamSelectionScene;