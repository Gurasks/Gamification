import { Check, MessageSquareMore, PencilLine, SendHorizontal, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Card, PersistentUser } from "../types/global";
import StarRating from "./StarRating";

interface BoardCardProps {
  card: Card;
  user: PersistentUser;
  handleRate: (cardId: string, rating: number) => void;
  onEdit: (cardId: string, newText: string) => Promise<void>;
  onComment: (cardId: string, commentText: string) => Promise<void>;
  onCommentEdit: (cardId: string, commentId: string, newText: string) => Promise<void>;
}

const BoardCard: React.FC<BoardCardProps> = ({
  card,
  user,
  handleRate,
  onEdit,
  onCommentEdit,
  onComment
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commentIdToEdit, setCommentIdToEdit] = useState("");
  const [editText, setEditText] = useState(card.text);
  const [editCommentText, setEditCommentText] = useState("");
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      await onComment(card.id, commentText);
      setCommentText('');
    }
  };

  const handleEditSubmit = async () => {
    await onEdit(card.id, editText);
    setIsEditing(false);
  };

  const handleCommentEditSubmit = async () => {
    await onCommentEdit(card.id, commentIdToEdit, editCommentText);
    setCommentIdToEdit("");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:border-indigo-200 transition-colors">
      {/* Card Content */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 border rounded"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleEditSubmit}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              title="Salvar"
            >
              <Check />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-white bg-red-400 rounded hover:bg-red-500"
              title="Cancelar"
            >
              <X />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.text}</h3>
          {user.id === card.createdById && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-indigo-500 hover:text-indigo-700"
              title="Editar"
            >
              <PencilLine />
            </button>
          )}
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-2">
        {showComments && (
          <div className="mt-2 space-y-2">
            {card.comments?.map((comment) => (
              <div key={comment.id} className="p-2 bg-gray-50 rounded text-sm">
                {commentIdToEdit === comment.id ? (
                  <div className="mb-3">
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      className="w-full p-2 border rounded"
                      autoFocus
                    />
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
                  </div>
                ) : (
                  <p>{comment.text}</p>
                )
                }
                {user.id === comment.createdById && (
                  <button
                    onClick={() => {
                      setCommentIdToEdit(comment.id)
                      setEditCommentText(comment.text)
                    }}
                    className="text-xs text-indigo-500 hover:text-indigo-700"
                    title="Editar"
                  >
                    <PencilLine />
                  </button>
                )}
                <p className="text-xs text-gray-400">- {comment.createdBy}</p>
              </div>
            ))}

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-1 text-sm border rounded"
                ref={commentInputRef}
              />
              <button
                onClick={handleCommentSubmit}
                className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                title="Comentar"
              >
                <SendHorizontal size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rating and Author */}
      <div className="flex justify-between items-center mt-3">
        <p className="text-xs text-gray-500">- {card.createdBy}</p>
        <StarRating
          ratings={card.ratings || {}}
          onRate={(rating) => handleRate(card.id, rating)}
          userRating={card.ratings?.[user.id]}
        />
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-gray-500 hover:text-gray-700"
          title="comentários"
        >
          <MessageSquareMore />
        </button>
      </div>
    </div>
  );
};

export default BoardCard;