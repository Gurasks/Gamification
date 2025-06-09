import React from 'react';
import { calculateAverageRating } from '../services/boardService';

interface StarRatingProps {
  ratings: Record<string, number>;
  onRate: (rating: number) => void;
  userRating?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ ratings, onRate, userRating }) => {
  const rating = calculateAverageRating(ratings);
  const [hoveredStar, setHoveredStar] = React.useState<number | null>(null);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(null)}
          className={`text-xl transition-colors duration-100 focus:outline-none ${((hoveredStar !== null && star <= hoveredStar) ||
            (hoveredStar === null && (userRating ?? 0) >= star))
            ? 'text-yellow-500'
            : 'text-gray-300'
            } hover:text-yellow-400`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {rating.toFixed(1)} ({Object.keys(ratings).length})
      </span>
    </div>
  );
};

export default StarRating;