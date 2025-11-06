import { calculateAverageRating } from "../../../services/globalServices";
import type { Session } from "../../../types/global";
import type { UserContributions, UserStats } from "../../../types/leaderboard";

interface ContributionsModalProps {
  session: Session | null;
  selectedUser: UserContributions;
  sortedData: UserStats[];
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Contribuições de {selectedUser.user.userName}
              </h2>
              <p className="text-blue-100">
                Time: {session?.teams?.[selectedUser.user.userId] || 'N/A'} •
                Posição: #{sortedData.findIndex(u => u.userId === selectedUser.user.userId) + 1}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="text-white hover:text-blue-200 transition-colors duration-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedUser.user.totalCardsCreated}</div>
              <div className="text-sm text-blue-800">Sugestões Criadas</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{selectedUser.user.totalComments}</div>
              <div className="text-sm text-green-800">Comentários Feitos</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{selectedUser.user.averageRating}</div>
              <div className="text-sm text-yellow-800">Nota Média ⭐</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedUser.user.totalReplies}</div>
              <div className="text-sm text-purple-800">Respostas</div>
            </div>
          </div>

          {/* Sugestões Criadas */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">💡</span>
              Sugestões Criadas ({selectedUser.cardsCreated.length})
            </h3>
            {selectedUser.cardsCreated.length > 0 ? (
              <div className="space-y-4">
                {selectedUser.cardsCreated.map((card) => (
                  <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{card.text}</h4>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {card.teamName}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Avaliação: </span>
                      {card.ratings ? `${calculateAverageRating(card.ratings).toFixed(1)} ⭐` : 'Sem avaliações'}
                    </div>
                    {card.comments && card.comments.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Comentários: </span>
                        {card.comments.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhuma sugestão criada</p>
            )}
          </div>

          {/* Comentários Feitos */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-green-100 text-green-600 p-2 rounded-lg">💬</span>
              Comentários Feitos ({selectedUser.comments.length})
            </h3>
            {selectedUser.comments.length > 0 ? (
              <div className="space-y-4">
                {selectedUser.comments.map(({ card, comment }) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">Sugestão:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">{card.text}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Time: {card.teamName} • Autor: {card.createdBy}
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <h5 className="font-medium text-gray-900 mb-1">Comentário:</h5>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                        {comment.text}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum comentário feito</p>
            )}
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={closeModal}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContributionsModal;