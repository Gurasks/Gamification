import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import type { PersistentUser } from './global-types';

interface OwnerTeamAssignmentProps {
  refinementId: string;
  members: PersistentUser[];
  availableTeams: string[];
  currentAssignments: Record<string, string>;
}

const OwnerTeamAssignment: React.FC<OwnerTeamAssignmentProps> = ({
  refinementId,
  members,
  availableTeams,
  currentAssignments,
}) => {
  const assignParticipantToTeam = async (userId: string, team: string) => {
    await updateDoc(doc(db, 'refinements', refinementId), {
      [`teams.${userId}`]: team,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Atribua os times</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participantes</th>
            {availableTeams.map((team) => (
              <th key={team} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{team}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((participant) => (
            <tr key={participant.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {participant.name}
              </td>
              {availableTeams.map((team) => (
                <td key={team} className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="radio"
                    name={`team-${participant.id}`}
                    checked={currentAssignments[participant.id] === team}
                    onChange={() => assignParticipantToTeam(participant.id, team)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OwnerTeamAssignment;