import { Check, MessageSquareMore, PencilLine, X } from 'lucide-react';
import { useState } from 'react';
import type { Card } from "../../../types/global";
import VariableTextArea from "../../../components/VariableTextArea";
import { User } from 'firebase/auth';
import StarRating from './StarRating';
import { stringToPastelBg } from '@/services/boardServices';

interface BoardCardProps {
  card: Card;
  user: User;
  handleRate: (cardId: string, rating: number) => void;
  onEdit: (cardId: string, newText: string) => Promise<void>;
  onComment: (cardId: string, commentText: string) => Promise<void>;
  onCommentEdit: (cardId: string, commentId: string, newText: string) => Promise<void>;
  timeEnded?: boolean;
}

const BoardCard: React.FC<BoardCardProps> = ({
  card,
  user,
  handleRate,
  onEdit,
  onCommentEdit,
  onComment,
  timeEnded = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commentIdToEdit, setCommentIdToEdit] = useState("");
  const [editText, setEditText] = useState(card.text);
  const [editCommentText, setEditCommentText] = useState("");
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const pastelBgClass = stringToPastelBg(card.createdBy);

  const handleCommentSubmit = async () => {
    if (commentText.trim() && !timeEnded) {
      await onComment(card.id, commentText);
      setCommentText('');
    }
  };

  const handleEditSubmit = async () => {
    if (!timeEnded) {
      await onEdit(card.id, editText);
      setIsEditing(false);
    }
  };

  const handleCommentEditSubmit = async () => {
    if (!timeEnded) {
      await onCommentEdit(card.id, commentIdToEdit, editCommentText);
      setCommentIdToEdit("");
    }
  };

  return (
    <div className={`text-sm [text-align:justify] p-4 ${pastelBgClass} rounded-lg shadow border border-gray-200 hover:border-indigo-200 transition-colors ${timeEnded ? 'opacity-90' : ''
      }`}>
      {/* Card Content */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText((e.target as HTMLTextAreaElement).value)}
            className="w-full p-2 border rounded"
            autoFocus
            disabled={timeEnded}
          />
          <div className="ml-4 flex gap-2 mt-2">
            <button
              onClick={handleEditSubmit}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Salvar"
              disabled={timeEnded}
            >
              <Check />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-white bg-red-400 rounded hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Cancelar"
              disabled={timeEnded}
            >
              <X />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <h3 className="text-base font-semibold text-gray-800 mb-2">{card.text}</h3>
          {!timeEnded && user.uid === card.createdById && (
            <button
              onClick={() => setIsEditing(true)}
              className="ml-4 text-xs text-indigo-500 hover:text-indigo-700"
              title="Editar"
            >
              <PencilLine />
            </button>
          )}
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-2">
        {/* Botão para mostrar/ocultar comentários */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`text-xs flex items-center gap-1 mb-2 ${timeEnded ? 'text-gray-700 cursor-pointer' : 'text-gray-700 hover:text-gray-700'
            }`}
          title={timeEnded ? "Visualizar comentários" : "Comentários"}
        >
          <MessageSquareMore size={14} />
          {card.comments?.length || 0} comentário(s)
        </button>

        {showComments && (
          <div className="mt-2 space-y-2">
            {/* Lista de comentários existentes */}
            {card.comments?.map((comment) => (
              <div key={comment.id} className="flex justify-between items-start p-2 bg-white/40 rounded text-sm">
                <div className="flex-grow">
                  {commentIdToEdit === comment.id ? (
                    <div className="mb-3 w-full">
                      <VariableTextArea
                        text={editCommentText}
                        setText={setEditCommentText}
                        handleSubmit={handleCommentEditSubmit}
                        disabled={timeEnded}
                        placeholder={timeEnded ? "Edição desabilitada" : "Editar comentário..."}
                      />
                      {!timeEnded && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleCommentEditSubmit}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="Salvar"
                          >
                            <Check />
                          </button>
                          <button
                            onClick={() => setCommentIdToEdit("")}
                            className="px-3 py-1 text-white bg-red-400 rounded hover:bg-red-500"
                            title="Cancelar"
                          >
                            <X />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800">{comment.text}</p>
                      <p className="text-xs text-gray-600 mt-1">- {comment.createdBy}</p>
                    </>
                  )}
                </div>
                {!timeEnded && user.uid === comment.createdById && commentIdToEdit !== comment.id && (
                  <button
                    onClick={() => {
                      setCommentIdToEdit(comment.id);
                      setEditCommentText(comment.text);
                    }}
                    className="text-xs text-indigo-500 hover:text-indigo-700 pl-2 flex-shrink-0"
                    title="Editar"
                  >
                    <PencilLine size={14} />
                  </button>
                )}
              </div>
            ))}

            {!timeEnded && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-700 mb-2">Adicionar comentário:</p>
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

      {/* Rating and Author */}
      <div className="flex justify-between items-center mt-3">
        <p className="text-xs font-semibold text-gray-800">- {card.createdBy}</p>
        <StarRating
          ratings={card.ratings || {}}
          onRate={(rating) => {
            if (!timeEnded) {
              handleRate(card.id, rating);
            }
          }}
          userRating={card.ratings?.[user.uid]}
          showReadonly={timeEnded}
        />
      </div>
    </div>
  );
};

export default BoardCard;