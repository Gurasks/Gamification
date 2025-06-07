import type { Card, PersistentUser } from "../types/global";
import StarRating from "./StarRating";

interface BoardCardProps {
  card: Card;
  user: PersistentUser;
  handleRate: (cardId: string, rating: number) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ card, user, handleRate }) => {
  return (
    <div
      key={card.id}
      className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:border-indigo-200 transition-colors"
    >
      <p className="text-gray-800 mb-2">{card.text}</p>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">- {card.createdBy}</p>
        <StarRating
          ratings={card.ratings || {}}
          onRate={(rating) => handleRate(card.id, rating)}
          userRating={card.ratings?.[user.id]}
        />
      </div>
    </div>
  );
};

export default BoardCard;