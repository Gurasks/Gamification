import metadataService from '@/services/metadataOptionsService';
import { User } from 'firebase/auth';
import {
  Check,
  Clock,
  MessageSquareMore,
  PencilLine,
  Trash2,
  Vote,
  X
} from 'lucide-react';
import { useState } from 'react';
import VariableTextArea from "../../../components/VariableTextArea";
import type { Card, MetadataType, VoteValue } from "../../../types/global";
import StarRating from '../../BoardScene/components/StarRating';
import MetadataVote from './MetadataVote';
import { calculateVotes } from '@/services/metadataVoteServices';

interface AnonymousCardProps {
  card: Card;
  user: User;
  onRate: (cardId: string, rating: number) => void;
  onComment: (cardId: string, commentText: string) => Promise<void>;
  onCommentEdit: (cardId: string, commentId: string, newText: string) => Promise<void>;
  onCommentDelete: (cardId: string, commentId: string) => Promise<void>;
  onMetadataVote: (cardId: string, metadataType: MetadataType, vote: VoteValue) => Promise<void>;
  isReadOnly: boolean;
}

const AnonymousCard: React.FC<AnonymousCardProps> = ({
  card,
  user,
  onRate,
  onComment,
  onCommentEdit,
  onCommentDelete,
  onMetadataVote,
  isReadOnly = false
}) => {
  const [commentIdToEdit, setCommentIdToEdit] = useState("");
  const [editCommentText, setEditCommentText] = useState("");
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showMetadataVotes, setShowMetadataVotes] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

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

  const handleDeleteComment = async (commentId: string) => {
    if (!isReadOnly && onCommentDelete && window.confirm('Tem certeza que deseja excluir este comentário?')) {
      setDeletingCommentId(commentId);
      try {
        await onCommentDelete(card.id, commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
      } finally {
        setDeletingCommentId(null);
      }
    }
  };

  const priorityOption = card.priority ? metadataService.getPriorityOption(card.priority) : undefined;
  const requirementTypeOption = card.requirementType ? metadataService.getRequirementTypeOption(card.requirementType) : undefined;
  const categoryOption = card.category ? metadataService.getCategoryOption(card.category) : undefined;


  const getUserVote = (metadataType: MetadataType): VoteValue | undefined => {
    const votes = card.metadataVotes?.[metadataType];
    return votes?.[user.uid];
  };

  const handleMetadataVote = async (metadataType: MetadataType, vote: VoteValue) => {
    if (!isReadOnly && onMetadataVote) {
      await onMetadataVote(card.id, metadataType, vote);
    }
  };

  const hasMetadataToVote = card.priority || card.requirementType || card.category || card.estimatedEffort;

  const priorityVotes = calculateVotes(card.metadataVotes?.priority)
  const requirementTypeVotes = calculateVotes(card.metadataVotes?.requirementType)
  const categoryVotes = calculateVotes(card.metadataVotes?.category)
  const estimatedEffortVotes = calculateVotes(card.metadataVotes?.estimatedEffort)

  return (
    <div className={`text-sm [text-align:justify] p-4 bg-white rounded-xl shadow-lg border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl ${isReadOnly ? 'opacity-95' : ''
      }`}>
      {/* Card Content */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-semibold text-gray-800 leading-relaxed">{card.text}</h3>
      </div>

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
                <span>{card.estimatedEffort}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {hasMetadataToVote && (
        <div className="mb-3">
          <button
            onClick={() => setShowMetadataVotes(!showMetadataVotes)}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${isReadOnly
              ? 'text-gray-600 cursor-pointer hover:text-gray-800'
              : 'text-blue-600 hover:text-blue-800'
              }`}
            title={isReadOnly ? "Visualizar votos nos metadados" : "Votar nos metadados"}
          >
            <Vote size={16} />
            <span>
              Votar nos metadados
            </span>
          </button>
        </div>
      )}

      {/* Seção de votação em metadados */}
      {showMetadataVotes && hasMetadataToVote && (
        <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <div className="space-y-3">
            {card.priority && priorityOption && (
              <MetadataVote
                metadataType="priority"
                metadataValue={card.priority}
                metadataLabel={priorityOption.label}
                currentVote={getUserVote('priority')}
                onVote={(vote) => handleMetadataVote('priority', vote)}
                isReadOnly={isReadOnly}
                agreeCount={priorityVotes.agree}
                disagreeCount={priorityVotes.disagree}
                neutralCount={priorityVotes.neutral}
              />
            )}

            {card.requirementType && requirementTypeOption && (
              <MetadataVote
                metadataType="requirementType"
                metadataValue={card.requirementType}
                metadataLabel={requirementTypeOption.label}
                currentVote={getUserVote('requirementType')}
                onVote={(vote) => handleMetadataVote('requirementType', vote)}
                isReadOnly={isReadOnly}
                agreeCount={requirementTypeVotes.agree}
                disagreeCount={requirementTypeVotes.disagree}
                neutralCount={requirementTypeVotes.neutral}
              />
            )}

            {card.category && categoryOption && (
              <MetadataVote
                metadataType="category"
                metadataValue={card.category}
                metadataLabel={categoryOption.label}
                currentVote={getUserVote('category')}
                onVote={(vote) => handleMetadataVote('category', vote)}
                isReadOnly={isReadOnly}
                agreeCount={categoryVotes.agree}
                disagreeCount={categoryVotes.disagree}
                neutralCount={categoryVotes.neutral}
              />
            )}

            {card.estimatedEffort !== undefined && (
              <MetadataVote
                metadataType="estimatedEffort"
                metadataValue={card.estimatedEffort}
                metadataLabel={`${card.estimatedEffort} horas`}
                currentVote={getUserVote('estimatedEffort')}
                onVote={(vote) => handleMetadataVote('estimatedEffort', vote)}
                isReadOnly={isReadOnly}
                agreeCount={estimatedEffortVotes.agree}
                disagreeCount={estimatedEffortVotes.disagree}
                neutralCount={estimatedEffortVotes.neutral}
              />
            )}
          </div>
        </div>
      )}

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
            {card.comments?.map((comment) => {
              const isCommentOwner = user.uid === comment.createdById;
              const isDeleting = deletingCommentId === comment.id;

              return (
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
                        <p className="text-gray-800 text-sm leading-relaxed">{comment.text}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-600 font-medium">
                            — {comment.createdBy}
                          </p>
                          {!isReadOnly && isCommentOwner && (
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => {
                                  setCommentIdToEdit(comment.id);
                                  setEditCommentText(comment.text);
                                }}
                                className="text-xs text-indigo-500 hover:text-indigo-700 p-1"
                                title="Editar comentário"
                              >
                                <PencilLine size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={isDeleting}
                                className="text-xs text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                                title="Excluir comentário"
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