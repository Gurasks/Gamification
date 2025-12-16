import { openUserContributions } from "../../../services/leaderboardServices";
import type { Card, Session } from "../../../types/global";
import type { LeaderboardSortTypes, UserContributions, UserStats } from "../../../types/leaderboard";
import { Trophy, MessageSquare, Star, FileText, ThumbsUp, TrendingUp } from 'lucide-react';
import ParticipantCard from "./ParticipantCard";

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

  return (
    <div>
      {/* Sorting Controls */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setSortBy('score')}
          className={`px-5 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${sortBy === 'score'
            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg transform scale-105'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <Trophy className="w-4 h-4" />
          Pontuação Total
        </button>
        <button
          onClick={() => setSortBy('comments')}
          className={`px-5 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${sortBy === 'comments'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          Mais Comentários
        </button>
        <button
          onClick={() => setSortBy('rating')}
          className={`px-5 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${sortBy === 'rating'
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <Star className="w-4 h-4" />
          Melhores Avaliações
        </button>
        <button
          onClick={() => setSortBy('cards')}
          className={`px-5 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${sortBy === 'cards'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <FileText className="w-4 h-4" />
          Mais Sugestões
        </button>
      </div>

      {/* Grid de Participants Cards */}
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
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum participante ainda</h3>
          <p className="text-gray-500 mb-6">A tabela de classificação será preenchida quando os participantes começarem a interagir.</p>
        </div>
      )}
    </div>
  )
}

export default MembersLeaderboard;