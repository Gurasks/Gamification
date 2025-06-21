import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OwnerTeamAssignment from '../components/OwnerTeamAssignment';
import SelectionMethodChooser from '../components/SelectionMethodChooser';
import TeamSelection from '../components/TeamSelection';
import { useUser } from '../components/UserContext';
import { createUnsubscribeMembers } from '../hooks/firestoreUnsubscriber';
import type { PersistentUser, Refinement } from '../types/global';
import { startRefinementInFirebase, updateNumOfTeamsToRefinementInFirebase, updateSelectionMethodToRefinementInFirebase } from '../services/firestoreService';


const TeamSelectionScene: React.FC = () => {
  const { refinementId } = useParams<{ refinementId: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [members, setMembers] = useState<PersistentUser[]>([] as PersistentUser[]);
  const [numOfTeams, setNumOfTeams] = useState<number>(2);
  const [owner, setOwner] = useState<string>('');
  const [teamParticipants, setTeamParticipants] = useState<Record<string, string>>({});
  const [refinement, setRefinement] = useState<Refinement | null>(null);


  useEffect(() => {
    if (!refinementId) return;
    const unsubscribeMembers = createUnsubscribeMembers(
      refinementId,
      user,
      setRefinement,
      setAvailableTeams,
      setIsOwner,
      setNumOfTeams,
      setOwner,
      setMembers,
      navigate
    );

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
              onChange={e => updateNumOfTeamsToRefinementInFirebase(refinementId, setAvailableTeams, e)}
            />
            <SelectionMethodChooser
              currentMethod={refinement.selectionMethod || 'RANDOM'}
              onMethodChange={(method) => updateSelectionMethodToRefinementInFirebase(refinementId, method)}
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
          onClick={() => startRefinementInFirebase(refinement, refinementId, user, navigate)}
          disabled={user.id !== owner}
          className={`w-full py-2 px-4 rounded-md shadow-sm text-white ${!refinementId || user.id !== owner ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          Começar
        </button>) : null}
      </div>
    </div>
  ) : null;
};

export default TeamSelectionScene;