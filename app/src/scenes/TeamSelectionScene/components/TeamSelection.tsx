import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import type { SelectionMethod } from '../../../types/teamSelection';
import { useAuth } from '../../../contexts/AuthContext';

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
  const { user, loading } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(currentTeam || '');
  const [_assignedTeams, setAssignedTeams] = useState<Record<string, string>>({});
  const [isAssigning, setIsAssigning] = useState(false);

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
    if (
      selectionMethod === 'RANDOM' &&
      !currentTeam &&
      availableTeams.length > 0 &&
      user
    ) {
      const randomTeam = availableTeams[
        Math.floor(Math.random() * availableTeams.length)
      ];
      assignTeam(randomTeam);
    }
  }, [selectionMethod, currentTeam, availableTeams, user]);

  const assignTeam = async (team: string) => {
    if (!user || !refinementId) return;

    setIsAssigning(true);
    try {
      await updateDoc(doc(db, 'refinements', refinementId), {
        [`teams.${user.uid}`]: team,
      });
      setSelectedTeam(team);
    } catch (error) {
      console.error('Erro ao atribuir time:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleTeamSelect = (team: string) => {
    if (selectionMethod === 'CHOOSE_YOUR_TEAM' && !isAssigning) {
      assignTeam(team);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 text-blue-800 rounded flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800"></div>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded">
        Erro: Usuário não autenticado
      </div>
    );
  }

  if (selectionMethod === 'OWNER_CHOOSES' && !currentTeam) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
        Esperando o dono da sessão para atribuir seu time...
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
                disabled={isAssigning}
                className={`px-4 py-2 rounded transition-colors ${selectedTeam === team
                  ? 'bg-indigo-600 text-white'
                  : isAssigning
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
              >
                {team} {isAssigning && '...'}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTeam && (
        <div className="p-3 bg-green-50 text-green-800 rounded border border-green-200">
          Seu time é o <strong className="font-semibold">{selectedTeam}</strong>
        </div>
      )}
    </div>
  );
};

export default TeamSelection;