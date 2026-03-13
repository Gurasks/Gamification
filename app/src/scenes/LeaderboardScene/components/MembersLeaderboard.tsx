import { openUserContributions } from "../../../services/leaderboardServices";
import type { Card, Session } from "../../../types/global";
import type { LeaderboardSortTypes, UserContributions, UserStats } from "../../../types/leaderboard";
import { Trophy, MessageSquare, Star, FileText, ThumbsUp, TrendingUp } from 'lucide-react';
import ParticipantCard from "./ParticipantCard";
import { useLanguage } from "@/hooks/useLanguage";

interface MembersLeaderboardProps {
  session: Session;
  sortedData: (UserStats & { totalScore?: number; gamificationPoints?: any })[];
  allCards: Card[],
  sortBy: LeaderboardSortTypes,
  setSelectedUser: React.Dispatch<
    React.SetStateAction<UserContributions | null>
  >,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setSortBy: React.Dispatch<React.SetStateAction<LeaderboardSortTypes>>,
}

const MembersLeaderboard: React.FC<MembersLeaderboardProps> = ({
  session,
  sortedData,
  allCards,
  sortBy,
  setSelectedUser,
  setIsModalOpen,
  setSortBy,
}) => {
  const { t } = useLanguage();

  const sortButtons = [
    {
      key: 'score' as LeaderboardSortTypes,
      label: t('membersLeaderboard.totalScore'),
      icon: Trophy,
      color: 'yellow'
    },
    {
      key: 'comments' as LeaderboardSortTypes,
      label: t('membersLeaderboard.mostComments'),
      icon: MessageSquare,
      color: 'blue'
    },
    {
      key: 'rating' as LeaderboardSortTypes,
      label: t('membersLeaderboard.bestRatings'),
      icon: Star,
      color: 'green'
    },
    {
      key: 'cards' as LeaderboardSortTypes,
      label: t('membersLeaderboard.mostSuggestions'),
      icon: FileText,
      color: 'purple'
    }
  ];

  return (
    <div>
      {/* Sorting Controls */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {sortButtons.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`px-5 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${sortBy === key
                ? `bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg transform scale-105`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Participants Cards Grid */}
      {sortedData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedData.map((user, index) => (
            <ParticipantCard
              key={user.userId}
              user={user}
              session={session}
              rank={index + 1}
              onViewDetails={() => openUserContributions(user, allCards, setSelectedUser, setIsModalOpen)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('membersLeaderboard.noParticipants')}</h3>
          <p className="text-gray-500 mb-6">{t('membersLeaderboard.noParticipantsDescription')}</p>
        </div>
      )}
    </div>
  )
}

export default MembersLeaderboard;