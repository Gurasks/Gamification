import React from 'react';
import { MessageSquare, Star, FileText, ThumbsUp, Award } from 'lucide-react';
import { Session } from '@/types/global';
import { UserStats } from '@/types/leaderboard';

interface ParticipantCardProps {
  user: UserStats & { totalScore?: number; gamificationPoints?: any };
  session: Session;
  rank: number;
  onViewDetails: () => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  user,
  session,
  rank,
  onViewDetails
}) => {
  const getRankColor = () => {
    switch (rank) {
      case 1: return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300';
      case 2: return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300';
      case 3: return 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300';
      default: return 'bg-white border-gray-200';
    }
  };

  const getRankIcon = () => {
    switch (rank) {
      case 1: return <Award className="w-6 h-6 text-yellow-500" aria-hidden="true" />;
      case 2: return <Award className="w-6 h-6 text-gray-500" aria-hidden="true" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" aria-hidden="true" />;
      default: return <span className="text-lg font-bold text-gray-700">#{rank}</span>;
    }
  };

  // Handler para navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewDetails();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onViewDetails}
      onKeyDown={handleKeyDown}
      className={`rounded-xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${getRankColor()}`}
      aria-label={`Ver detalhes das contribuições de ${user.userName}, rank ${rank} com ${user.totalScore || 0} pontos`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
            {getRankIcon()}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{user.userName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {session?.teams?.[user.userId] || 'Sem time'}
              </span>
            </div>
          </div>
        </div>

        {/* Pontuação Total */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{user.totalScore || 0}</div>
          <div className="text-xs text-gray-500">pontos</div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <MessageSquare className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <div>
            <div className="text-sm font-medium text-blue-800">{user.totalComments}</div>
            <div className="text-xs text-blue-600">Comentários</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <Star className="w-4 h-4 text-green-600" aria-hidden="true" />
          <div>
            <div className="text-sm font-medium text-green-800">{user.averageRating.toFixed(1)}</div>
            <div className="text-xs text-green-600">Avaliação Média</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
          <FileText className="w-4 h-4 text-purple-600" aria-hidden="true" />
          <div>
            <div className="text-sm font-medium text-purple-800">{user.totalCardsCreated}</div>
            <div className="text-xs text-purple-600">Sugestões</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
          <ThumbsUp className="w-4 h-4 text-amber-600" aria-hidden="true" />
          <div>
            <div className="text-sm font-medium text-amber-800">{user.totalReplies}</div>
            <div className="text-xs text-amber-600">Respostas</div>
          </div>
        </div>
      </div>

      {/* Gamificação */}
      {user.gamificationPoints && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Contribuições de gamificação:</div>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              {user.gamificationPoints?.metadataVotes?.agreeVotes || 0} votos concordados
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {user.gamificationPoints?.cardRatings?.totalRatings || 0} avaliações
            </span>
          </div>
        </div>
      )}

      {/* Ver Detalhes */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div
          className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1"
          role="presentation"
        >
          Ver contribuições detalhadas
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;