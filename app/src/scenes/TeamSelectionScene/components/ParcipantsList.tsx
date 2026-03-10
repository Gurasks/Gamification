import { useLanguage } from "@/hooks/useLanguage";
import { getLocalizedTeamName } from "@/services/teamSelectionServices";
import { UserData } from "@/types/global";
import { User } from "firebase/auth";
import { Users, Crown, UserIcon } from "lucide-react";

interface ParticipantsListProps {
  members: UserData[];
  user: User;
  owner: string;
  teamParticipants: Record<string, string>;
};

const ParticipantsList: React.FC<ParticipantsListProps> = ({ members, user, owner, teamParticipants }) => {
  const { t } = useLanguage();

  return (<div className="border-t pt-4">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Users className="w-5 h-5 text-gray-600" />
      {t('teamSelection.participantsList', { count: members.length })}
    </h3>
    <div className="bg-gray-50 rounded-lg p-4">
      <ul className="space-y-2">
        {members.map(member => (
          <li
            key={member.uid}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${member.uid === owner
              ? 'bg-rose-50 border border-rose-200'
              : member.uid === user.uid
                ? 'bg-teal-50 border border-teal-200'
                : 'bg-white border border-gray-200'
              }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`font-medium ${member.uid === owner
                ? 'text-rose-700'
                : member.uid === user.uid
                  ? 'text-teal-700'
                  : 'text-gray-700'
                }`}>
                {member.displayName || member.email || member.uid}
              </span>
              {member.uid === owner && (
                <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full font-medium flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {t('team.organizer')}
                </span>
              )}
              {member.uid === user.uid && (
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full font-medium flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  {t('team.you')}
                </span>
              )}
            </div>

            {teamParticipants && teamParticipants[member.uid] && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-semibold">
                {getLocalizedTeamName(teamParticipants[member.uid], t)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  </div>);
}

export default ParticipantsList;