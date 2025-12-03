import { MessageSquareMore, Check, X, PencilLine } from 'lucide-react';
import { useState } from 'react';
import type { Card } from "../../../types/global";
import VariableTextArea from "../../../components/VariableTextArea";
import { User } from 'firebase/auth';
import StarRating from '../../BoardScene/components/StarRating';

interface AnonymousCardProps {
  card: Card;
  user: User;
  onRate: (cardId: string, rating: number) => void;
  onComment: (cardId: string, commentText: string) => Promise<void>;
  onCommentEdit: (cardId: string, commentId: string, newText: string) => Promise<void>;
  isReadOnly?: boolean;
}

const AnonymousCard: React.FC<AnonymousCardProps> = ({
  card,
  user,
  onRate,
  onComment,
  onCommentEdit,
  isReadOnly = false
}) => {
  const [commentIdToEdit, setCommentIdToEdit] = useState("");
  const [editCommentText, setEditCommentText] = useState("");
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleCommentSubmit = async () => {
    if (commentText.trim() && !isReadOnly) {
      await onComment(card.id, commentText);
      setCommentText('');
    }
  };

  const handleCommentEditSubmit = async () => {
    if (!isReadOnly) {
      await onCommentEdit(card.id, commentIdToEdit, editCommentText);
      setCommentIdToEdit("");
    }
  };

  return (
    <div className={`text-sm [text-align:justify] p-4 bg-white rounded-xl shadow-lg border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl ${isReadOnly ? 'opacity-95' : ''
      }`}>
      {/* Card Content */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-semibold text-gray-800 leading-relaxed">{card.text}</h3>
      </div>

      {/* Comments Section */}
      <div className="mt-3">
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 text-xs font-medium mb-3 transition-colors ${isReadOnly
            ? 'text-gray-600 cursor-pointer hover:text-gray-800'
            : 'text-purple-600 hover:text-purple-800'
            }`}
          title={isReadOnly ? "Visualizar comentários" : "Mostrar/ocultar comentários"}
        >
          <MessageSquareMore size={16} />
          <span>
            {card.comments?.length || 0} comentário{card.comments?.length !== 1 ? 's' : ''}
          </span>
        </button>

        {showComments && (
          <div className="mt-3 space-y-3">
            {/* Lista de comentários existentes */}
            {card.comments?.map((comment) => (
              <div key={comment.id} className="flex justify-between items-start p-3 bg-white/60 rounded-lg backdrop-blur-sm border border-white/30">
                <div className="flex-grow">
                  {commentIdToEdit === comment.id ? (
                    <div className="mb-3 w-full">
                      <VariableTextArea
                        text={editCommentText}
                        setText={setEditCommentText}
                        handleSubmit={handleCommentEditSubmit}
                        disabled={isReadOnly}
                        placeholder={isReadOnly ? "Edição desabilitada" : "Editar comentário..."}
                      />
                      {!isReadOnly && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleCommentEditSubmit}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            title="Salvar"
                          >
                            <Check className="w-3 h-3" />
                            <span className="text-xs">Salvar</span>
                          </button>
                          <button
                            onClick={() => setCommentIdToEdit("")}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Cancelar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800 text-sm leading-relaxed">{comment.text}</p>
                      <p className="text-xs text-gray-600 mt-2 font-medium">
                        — {comment.createdBy}
                      </p>
                    </>
                  )}
                </div>
                {!isReadOnly && user.uid === comment.createdById && commentIdToEdit !== comment.id && (
                  <button
                    onClick={() => {
                      setCommentIdToEdit(comment.id);
                      setEditCommentText(comment.text);
                    }}
                    className="ml-3 text-xs text-indigo-500 hover:text-indigo-700 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                    title="Editar comentário"
                  >
                    <PencilLine size={14} />
                  </button>
                )}
              </div>
            ))}

            {!isReadOnly && (
              <div className="mt-4 pt-4 border-t border-gray-300/50">
                <p className="text-xs font-medium text-gray-700 mb-3">Adicionar comentário:</p>
                <VariableTextArea
                  text={commentText}
                  setText={setCommentText}
                  handleSubmit={handleCommentSubmit}
                  placeholder="Digite seu comentário..."
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating and Anonymous Author */}
      <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-300/50">
        {/* Rating */}
        <StarRating
          ratings={card.ratings || {}}
          onRate={(rating) => {
            if (!isReadOnly) {
              onRate(card.id, rating);
            }
          }}
          userRating={card.ratings?.[user.uid]}
          showReadonly={isReadOnly}
        />
      </div>
    </div>
  );
};

export default AnonymousCard;