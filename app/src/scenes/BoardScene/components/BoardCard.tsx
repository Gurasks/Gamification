import { stringToPastelBg } from '@/services/boardServices';
import metadataService from '@/services/metadataOptionsService';
import { User } from 'firebase/auth';
import {
  Check,
  Clock,
  Hash,
  MessageSquareMore,
  PencilLine,
  Trash2,
  X
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import VariableTextArea from "../../../components/VariableTextArea";
import type { Card } from "../../../types/global";

interface BoardCardProps {
  card: Card;
  user: User;
  onEdit: (cardId: string, newText: string) => Promise<void>;
  onComment: (cardId: string, commentText: string) => Promise<void>;
  onCommentEdit: (cardId: string, commentId: string, newText: string) => Promise<void>;
  onDelete?: (cardId: string) => Promise<void>;
  onCommentDelete?: (cardId: string, commentId: string) => Promise<void>;
  timeEnded?: boolean;
}

const BoardCard: React.FC<BoardCardProps> = ({
  card,
  user,
  onEdit,
  onCommentEdit,
  onComment,
  onDelete,
  onCommentDelete,
  timeEnded = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commentIdToEdit, setCommentIdToEdit] = useState("");
  const [editText, setEditText] = useState(card.text);
  const [editCommentText, setEditCommentText] = useState("");
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
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

  const handleDeleteCard = async () => {
    if (!timeEnded && onDelete && window.confirm('Tem certeza que deseja excluir esta sugestão?')) {
      setIsDeletingCard(true);
      try {
        await onDelete(card.id);
      } catch (error) {
        toast.error('Erro ao deletar sugestão');
      } finally {
        setIsDeletingCard(false);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!timeEnded && onCommentDelete && window.confirm('Tem certeza que deseja excluir este comentário?')) {
      setDeletingCommentId(commentId);
      try {
        await onCommentDelete(card.id, commentId);
      } catch (error) {
        toast.error('Erro ao deletar comentário');
      } finally {
        setDeletingCommentId(null);
      }
    }
  };

  const priorityOption = card.priority ? metadataService.getPriorityOption(card.priority) : undefined;
  const requirementTypeOption = card.requirementType ? metadataService.getRequirementTypeOption(card.requirementType) : undefined;
  const categoryOption = card.category ? metadataService.getCategoryOption(card.category) : undefined;

  const isCardOwner = user.uid === card.createdById;
  const canEditCard = !timeEnded && isCardOwner;
  const canDeleteCard = !timeEnded && isCardOwner;

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
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleEditSubmit}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Salvar"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">{card.text}</h3>
          </div>

          <div className="flex gap-1 ml-2">
            {canEditCard && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-500 hover:text-indigo-700 p-1"
                title="Editar sugestão"
              >
                <PencilLine size={14} />
              </button>
            )}

            {canDeleteCard && (
              <button
                onClick={handleDeleteCard}
                disabled={isDeletingCard}
                className="text-xs text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Excluir sugestão"
              >
                {isDeletingCard ? (
                  <Clock size={14} className="animate-pulse" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Metadados do Card */}
      {(card.priority || card.requirementType || card.category || card.estimatedEffort) && (
        <div className="mt-3 mb-3 space-y-2">
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
                <span>{card.estimatedEffort}h</span>
              </span>
            )}
          </div>
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
            {card.comments?.map((comment) => {
              const isCommentOwner = user.uid === comment.createdById;
              const isDeleting = deletingCommentId === comment.id;

              return (
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
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              title="Salvar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCommentIdToEdit("")}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-800">{comment.text}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-600">- {comment.createdBy}</p>
                          {!timeEnded && isCommentOwner && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setCommentIdToEdit(comment.id);
                                  setEditCommentText(comment.text);
                                }}
                                className="text-xs text-indigo-500 hover:text-indigo-700"
                                title="Editar"
                              >
                                <PencilLine size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={isDeleting}
                                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                                title="Excluir"
                              >
                                {isDeleting ? (
                                  <Clock size={12} className="animate-pulse" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

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

      {/* Author */}
      <div className="flex justify-between items-center mt-3">
        <p className="text-xs font-semibold text-gray-800">- {card.createdBy}</p>
      </div>
    </div>
  );
};

export default BoardCard;