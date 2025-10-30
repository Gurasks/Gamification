import { Check, MessageSquareMore, PencilLine, X } from 'lucide-react';
import { useState } from 'react';
import type { Card, PersistentUser } from "../types/global";
import StarRating from "./StarRating";
import VariableTextArea from "./VariableTextArea";

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
    <div className="text-sm [text-align:justify] p-4 bg-white rounded-lg shadow border border-gray-200 hover:border-indigo-200 transition-colors">
      {/* Card Content */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText((e.target as HTMLTextAreaElement).value)}
            className="w-full p-2 border rounded"
            autoFocus
          />
          <div className="ml-4 flex gap-2 mt-2">
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
          <h3 className="text-base font-semibold text-gray-800 mb-2">{card.text}</h3>
          {user.id === card.createdById && (
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
        {showComments && (
          <div className="mt-2 space-y-2">
            {card.comments?.map((comment) => (
              <div key={comment.id} className="flex justify-between items-start p-1 bg-gray-50 rounded text-sm">
                <div key={comment.id} className="flex-grow w-full resize-none text-sm [text-align:justify] p-2 bg-gray-50 rounded text-sm">
                  {commentIdToEdit === comment.id ? (
                    <div className="mb-3 w-full">
                      <VariableTextArea
                        text={editCommentText}
                        setText={setCommentText}
                        handleSubmit={handleCommentSubmit}
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
                  <p className="text-xs text-gray-400">- {comment.createdBy}</p>
                </div>
                {user.id === comment.createdById && (
                  <button
                    onClick={() => {
                      setCommentIdToEdit(comment.id)
                      setEditCommentText(comment.text)
                    }}
                    className="text-xs text-indigo-500 hover:text-indigo-700 pl-2"
                    title="Editar"
                  >
                    <PencilLine />
                  </button>
                )}
              </div>
            ))}

            <VariableTextArea
              text={commentText}
              setText={setCommentText}
              handleSubmit={handleCommentSubmit}
            />
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