const STORAGE_KEY = 'product_reviews';

export const getReviewsForProduct = (productId) => {
  try {
    const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return allReviews[productId] || [];
  } catch {
    return [];
  }
};

export const saveReviewForProduct = (productId, review) => {
  try {
    const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!allReviews[productId]) {
      allReviews[productId] = [];
    }
    allReviews[productId] = [review, ...allReviews[productId]];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
    return true;
  } catch (error) {
    console.error('Failed to save review:', error);
    return false;
  }
};

export const getAverageRating = (reviews) => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
};

export const getRatingDistribution = (reviews) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating]++;
    }
  });
  return distribution;
};
