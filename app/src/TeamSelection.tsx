import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config/firebase';
import { useUser } from './UserContext';
import type { SelectionMethod } from './global-types';

interface TeamSelectionProps {
  refinementId: string;
  selectionMethod: SelectionMethod;
  availableTeams: string[];
  currentTeam?: string;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  refinementId,
  selectionMethod,
  availableTeams,
  currentTeam,
}) => {
  const { user } = useUser();
  const [selectedTeam, setSelectedTeam] = useState(currentTeam || '');
  const [_assignedTeams, setAssignedTeams] = useState<Record<string, string>>({});

  // Listen for team assignments
  useEffect(() => {
    if (!refinementId) return;

    const unsubscribe = onSnapshot(doc(db, 'refinements', refinementId), (doc) => {
      setAssignedTeams(doc.data()?.teams || {});
    });

    return () => unsubscribe();
  }, [refinementId]);

  // Handle random assignment
  useEffect(() => {
    if (selectionMethod === 'RANDOM' && !currentTeam && availableTeams.length > 0) {
      const randomTeam = availableTeams[
        Math.floor(Math.random() * availableTeams.length)
      ];
      assignTeam(randomTeam);
    }
  }, [selectionMethod, currentTeam, availableTeams]);

  const assignTeam = async (team: string) => {
    if (!user || !refinementId) return;

    await updateDoc(doc(db, 'refinements', refinementId), {
      [`teams.${user.id}`]: team,
    });
    setSelectedTeam(team);
  };

  const handleTeamSelect = (team: string) => {
    if (selectionMethod === 'CHOOSE_YOUR_TEAM') {
      assignTeam(team);
    }
  };

  if (selectionMethod === 'OWNER_CHOOSES' && !currentTeam) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
        Esperando o dono do time para atribuir seu time...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectionMethod === 'CHOOSE_YOUR_TEAM' && (
        <div className="space-y-2">
          <h4 className="font-medium">Selecione o seu time:</h4>
          <div className="flex flex-wrap gap-2">
            {availableTeams.map((team) => (
              <button
                key={team}
                onClick={() => handleTeamSelect(team)}
                className={`px-4 py-2 rounded  ${selectedTeam === team
                  ? 'bg-indigo-600 text-blue-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-white'
                  }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTeam && (
        <div className="p-3 bg-green-50 text-green-800 rounded">
          Seu time é o <strong>{selectedTeam}</strong>
        </div>
      )}
    </div>
  );
};

export default TeamSelection;