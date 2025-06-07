export const calculateAverageRating = (ratings: Record<string, number>) => {
    if (!ratings || Object.keys(ratings).length === 0) return 0;
    const values = Object.values(ratings);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };