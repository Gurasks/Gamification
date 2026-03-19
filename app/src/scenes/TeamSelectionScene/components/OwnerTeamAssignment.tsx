import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedTeamName } from '@/services/teamSelectionServices';
import { UserData } from '@/types/global';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { db } from '../../../config/firebase';

interface OwnerTeamAssignmentProps {
  sessionId: string;
  members: UserData[];
  availableTeams: string[];
  currentAssignments: Record<string, string>;
}

const OwnerTeamAssignment: React.FC<OwnerTeamAssignmentProps> = ({
  sessionId,
  members,
  availableTeams,
  currentAssignments,
}) => {
  const { t } = useLanguage();
  const [assigningUser, setAssigningUser] = useState<string | null>(null);

  const assignParticipantToTeam = async (userId: string, team: string) => {
    if (!sessionId) return;

    setAssigningUser(userId);

    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        [`teams.${userId}`]: team,
      });
    } catch (error) {
      console.error('Erro ao atribuir time:', error);
    } finally {
      setAssigningUser(null);
    }
  };

  const teamCounts = availableTeams.reduce((acc, team) => {
    acc[team] = Object.values(currentAssignments).filter(t => t === team).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {t('team:selection.ownerAssignment.title')}
        </h3>

        <div className="flex gap-4 text-sm">
          {availableTeams.map(team => (
            <div key={team} className="flex items-center gap-1">
              <span className="font-medium text-gray-700">{getLocalizedTeamName(team, t)}:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${teamCounts[team] > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
                }`}>
                {teamCounts[team]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('team:selection.ownerAssignment.participants')}
              </th>
              {availableTeams.map(teamId => (
                <th
                  key={teamId}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getLocalizedTeamName(teamId, t)}
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('team:selection.ownerAssignment.currentTeam')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((participant) => (
              <tr
                key={participant.uid}
                className={assigningUser === participant.uid ? 'bg-blue-50' : 'hover:bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-800 text-sm font-medium">
                        {participant.displayName ? participant.displayName.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {participant.displayName || t('team:selection.ownerAssignment.anonymous')}
                      </div>
                      {participant.email && (
                        <div className="text-sm text-gray-500">
                          {participant.email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {availableTeams.map((team) => (
                  <td key={team} className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="radio"
                      name={`team-${participant.uid}`}
                      checked={currentAssignments[participant.uid] === team}
                      onChange={() => assignParticipantToTeam(participant.uid, team)}
                      disabled={assigningUser === participant.uid}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                  </td>
                ))}

                <td>
                  {currentAssignments[participant.uid] ? (
                    <span className="badge">
                      {getLocalizedTeamName(currentAssignments[participant.uid], t)}
                    </span>
                  ) : (
                    <span className="badge-gray">{t('team:unassigned')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading indicator */}
      {assigningUser && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin mr-2" />
          <span className="text-sm text-gray-600">{t('team:selection.ownerAssignment.assigning')}</span>
        </div>
      )}
    </div>
  );
};

export default OwnerTeamAssignment;