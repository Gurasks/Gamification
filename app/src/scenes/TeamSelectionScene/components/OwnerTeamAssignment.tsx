import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { UserData } from '@/types/global';

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

  // Contar participantes por time para visualização
  const teamCounts = availableTeams.reduce((acc, team) => {
    acc[team] = Object.values(currentAssignments).filter(t => t === team).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Atribuição de Times</h3>

        {/* Resumo dos times */}
        <div className="flex gap-4 text-sm">
          {availableTeams.map(team => (
            <div key={team} className="flex items-center gap-1">
              <span className="font-medium text-gray-700">{team}:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${teamCounts[team] > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
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
                Participantes
              </th>
              {availableTeams.map((team) => (
                <th
                  key={team}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {team}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Atual
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
                        {participant.displayName}
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

                <td className="px-6 py-4 whitespace-nowrap">
                  {currentAssignments[participant.uid] ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {currentAssignments[participant.uid]}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Não atribuído
                    </span>
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
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
          <span className="text-sm text-gray-600">Atribuindo time...</span>
        </div>
      )}

      {/* Dicas para o organizador */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium">Dica do organizador:</p>
            <p>Clique nos radios para atribuir participantes aos times. Tente distribuir igualmente para um jogo balanceado.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerTeamAssignment;