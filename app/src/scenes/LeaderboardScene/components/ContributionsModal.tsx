import { calculateAverageRating } from "../../../services/globalServices";
import type { Session, Card } from "../../../types/global";
import type { UserContributions, UserStats } from "../../../types/leaderboard";
import { X, FileText, MessageSquare, Star, TrendingUp, Award, Clock, Tag, Zap, Shield, Users, ThumbsUp, BarChart3, ExternalLink, Calendar } from 'lucide-react';
import metadataService from '@/services/metadataOptionsService';
import { Button } from '@/components/Button';

interface ContributionsModalProps {
  session: Session | null;
  selectedUser: UserContributions;
  sortedData: (UserStats)[];
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedUser: React.Dispatch<React.SetStateAction<UserContributions | null>>;
}

const ContributionsModal: React.FC<ContributionsModalProps> = ({
  session,
  selectedUser,
  sortedData,
  setIsModalOpen,
  setSelectedUser
}) => {
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const getUserRank = () => {
    return sortedData.findIndex(u => u.userId === selectedUser.user.userId) + 1;
  };

  const renderCardMetadata = (card: Card) => {
    const priorityOption = card.priority ? metadataService.getPriorityOption(card.priority) : undefined;
    const requirementTypeOption = card.requirementType ? metadataService.getRequirementTypeOption(card.requirementType) : undefined;
    const categoryOption = card.category ? metadataService.getCategoryOption(card.category) : undefined;

    return (
      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          {priorityOption && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${priorityOption.bgColor} ${priorityOption.color} ${priorityOption.borderColor}`}>
              {priorityOption.icon}
              <span>{priorityOption.label}</span>
            </span>
          )}

          {requirementTypeOption && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${requirementTypeOption.bgColor} ${requirementTypeOption.color} ${requirementTypeOption.borderColor}`}>
              {requirementTypeOption.icon}
              <span>{requirementTypeOption.label}</span>
            </span>
          )}

          {categoryOption && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${categoryOption.bgColor} ${categoryOption.color} ${categoryOption.borderColor}`}>
              {categoryOption.icon}
              <span>{categoryOption.label}</span>
            </span>
          )}

          {card.estimatedEffort && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full border border-amber-200">
              <Clock className="w-3 h-3" />
              <span>{card.estimatedEffort}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 to-yellow-600';
    if (rank === 2) return 'from-gray-500 to-gray-600';
    if (rank === 3) return 'from-orange-500 to-orange-600';
    return 'from-blue-500 to-blue-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Award className="w-6 h-6 text-yellow-300" />;
    if (rank === 2) return <Award className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-300" />;
    return <TrendingUp className="w-6 h-6 text-blue-300" />;
  };

  const userRank = getUserRank();
  const hasGamificationPoints = selectedUser.user && 'gamificationPoints' in selectedUser.user;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header do Modal */}
        <div className={`bg-gradient-to-r ${getRankColor(userRank)} p-6 text-white`}>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                {getRankIcon(userRank)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">
                    {selectedUser.user.userName}
                  </h2>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    #{userRank}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Time: {session?.teams?.[selectedUser.user.userId] || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{(selectedUser.user as any).totalScore || 0} pontos totais</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="text-white hover:text-blue-200 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="text-3xl font-bold text-blue-700">{selectedUser.user.totalCardsCreated}</div>
              </div>
              <div className="text-center text-sm font-medium text-blue-800">Sugestões Criadas</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div className="text-3xl font-bold text-green-700">{selectedUser.user.totalComments}</div>
              </div>
              <div className="text-center text-sm font-medium text-green-800">Comentários Feitos</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <div className="text-3xl font-bold text-yellow-700">{selectedUser.user.averageRating.toFixed(1)}</div>
              </div>
              <div className="text-center text-sm font-medium text-yellow-800">Nota Média</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ThumbsUp className="w-5 h-5 text-purple-600" />
                <div className="text-3xl font-bold text-purple-700">{selectedUser.user.totalReplies}</div>
              </div>
              <div className="text-center text-sm font-medium text-purple-800">Respostas</div>
            </div>
          </div>

          {/* Seção de Gamificação */}
          {hasGamificationPoints && selectedUser.user.gamificationPoints && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Pontuação de Gamificação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-gray-700">Votos em Metadados</h4>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {selectedUser.user.gamificationPoints?.metadataVotes?.agreeVotes || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      votos concordados • {selectedUser.user.gamificationPoints?.metadataVotes?.totalVotes || 0} totais
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-gray-700">Avaliações de Cards</h4>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {selectedUser.user.gamificationPoints?.cardRatings?.totalRatings || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      média {selectedUser.user.gamificationPoints?.cardRatings?.averageRating?.toFixed(1) || 0}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <h4 className="font-medium text-gray-700">Comentários</h4>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {selectedUser.user.gamificationPoints?.comments?.totalComments || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      contribuições de qualidade
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sugestões Criadas */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Sugestões Criadas
                  <span className="text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {selectedUser.cardsCreated.length}
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Cards de requisitos criados por {selectedUser.user.userName}
                </p>
              </div>
              {selectedUser.cardsCreated.length > 0 && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedUser.cardsCreated.length} itens
                </div>
              )}
            </div>

            {selectedUser.cardsCreated.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedUser.cardsCreated.map((card) => (
                  <div key={card.id} className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 leading-relaxed mb-2">{card.text}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            Time: {card.teamName}
                          </span>
                          {card.createdAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(card.createdAt.toDate()).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadados do Card */}
                    {renderCardMetadata(card)}

                    {/* Estatísticas do Card */}
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                      {card.ratings && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {calculateAverageRating(card.ratings).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({Object.keys(card.ratings).length} avaliações)
                          </span>
                        </div>
                      )}

                      {card.comments && card.comments.length > 0 && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {card.comments.length}
                          </span>
                          <span className="text-xs text-gray-500">comentários</span>
                        </div>
                      )}

                      {card.metadataVotes && (
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-gray-500">
                            {Object.values(card.metadataVotes).flatMap(Object.values).filter(v => v === 'agree').length} votos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma sugestão criada</h4>
                <p className="text-gray-500 max-w-md mx-auto">
                  {selectedUser.user.userName} ainda não criou nenhum card de requisitos nesta sessão.
                </p>
              </div>
            )}
          </div>

          {/* Comentários Feitos */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Comentários Feitos
                  <span className="text-sm font-normal bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {selectedUser.comments.length}
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Feedback e discussões participadas por {selectedUser.user.userName}
                </p>
              </div>
              {selectedUser.comments.length > 0 && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedUser.comments.length} comentários
                </div>
              )}
            </div>

            {selectedUser.comments.length > 0 ? (
              <div className="space-y-6">
                {selectedUser.comments.map(({ card, comment }) => (
                  <div key={comment.id} className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {/* Header do Card Original */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <h4 className="font-medium text-gray-900">Sugestão Original</h4>
                          </div>
                          <p className="text-gray-700 line-clamp-2">{card.text}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              Time: {card.teamName}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                              Autor: {card.createdBy}
                            </span>
                            {card.createdAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(card.createdAt.toDate()).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {card.ratings && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-bold text-gray-800">
                              {calculateAverageRating(card.ratings).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comentário do Usuário */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-2 border-white shadow-sm">
                          <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Comentário de {selectedUser.user.userName}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(comment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500 ml-12">
                        <p className="text-gray-800 leading-relaxed">{comment.text}</p>
                      </div>

                      {/* Estatísticas do Comentário */}
                      {card.comments && (
                        <div className="mt-4 pt-4 border-t border-gray-100 ml-12">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{card.comments.length} comentários nesta discussão</span>
                            </div>
                            {card.comments.findIndex(c => c.id === comment.id) !== -1 && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>Posição #{card.comments.findIndex(c => c.id === comment.id) + 1} na thread</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-green-50 rounded-xl border border-gray-200">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Nenhum comentário feito</h4>
                <p className="text-gray-500 max-w-md mx-auto">
                  {selectedUser.user.userName} ainda não participou de discussões nesta sessão.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Estatísticas atualizadas em tempo real</span>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={closeModal}
                variant="outline-secondary"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Fechar
              </Button>
              {hasGamificationPoints && (
                <Button
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Detalhes Completos
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContributionsModal;