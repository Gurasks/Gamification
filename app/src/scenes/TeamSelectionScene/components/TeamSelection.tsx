import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import type { SelectionMethod } from '../../../types/teamSelection';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { getLocalizedTeamName } from '@/services/teamSelectionServices';

interface TeamSelectionProps {
  sessionId: string;
  selectionMethod: SelectionMethod;
  availableTeams: string[];
  currentTeam?: string;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  sessionId,
  selectionMethod,
  availableTeams,
  currentTeam,
}) => {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(currentTeam || '');
  const [_assignedTeams, setAssignedTeams] = useState<Record<string, string>>({});
  const [isAssigning, setIsAssigning] = useState(false);

  // Listen for team assignments
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
      const teams = doc.data()?.teams || {};
      setAssignedTeams(teams);

      if (user && teams[user.uid]) {
        setSelectedTeam(teams[user.uid]);
      }
    });

    return () => unsubscribe();
  }, [sessionId, user]);

  // Handle random assignment
  useEffect(() => {
    if (
      selectionMethod === 'RANDOM' &&
      !currentTeam &&
      !selectedTeam &&
      availableTeams.length > 0 &&
      user &&
      !isAssigning
    ) {
      const randomTeam = availableTeams[
        Math.floor(Math.random() * availableTeams.length)
      ];
      assignTeam(randomTeam);
    }
  }, [selectionMethod, currentTeam, selectedTeam, availableTeams, user, isAssigning]);

  const assignTeam = async (team: string) => {
    if (!user || !sessionId || isAssigning) return;

    setIsAssigning(true);
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
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
    if (selectionMethod === 'CHOOSE_YOUR_TEAM' && !isAssigning && team !== selectedTeam) {
      assignTeam(team);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        {t('team:selection.unauthenticated')}
      </div>
    );
  }

  if (selectionMethod === 'OWNER_CHOOSES' && !currentTeam && !selectedTeam) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>{t('team:selection.waitingOwner')}</span>
      </div>
    );
  }

  const getButtonStyles = (team: string) => {
    if (selectedTeam === team) {
      return 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600';
    }
    if (isAssigning) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200';
    }
    return 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400';
  };

  return (
    <div className="space-y-4">
      {selectionMethod === 'CHOOSE_YOUR_TEAM' && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">
            {t('team:selection.selectYourTeam')}:
          </h4>
          <div className="flex flex-wrap gap-3">
            {availableTeams.map(teamId => (
              <button
                key={teamId}
                onClick={() => handleTeamSelect(teamId)}
                disabled={isAssigning || selectedTeam === teamId}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 border ${getButtonStyles(teamId)}`}
              >
                {getLocalizedTeamName(teamId, t)}
                {isAssigning && selectedTeam === teamId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}

              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTeam && (
        <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p>
            {t('team:selection.yourTeamIs')}{' '}
            <strong className="font-semibold">
              {getLocalizedTeamName(selectedTeam, t)}
            </strong>
          </p>
        </div>
      )}

      {selectionMethod === 'RANDOM' && !selectedTeam && (
        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('team:selection.assigningRandom')}</span>
        </div>
      )}
    </div>
  );
};

export default TeamSelection;