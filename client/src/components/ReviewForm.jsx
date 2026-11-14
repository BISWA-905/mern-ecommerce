import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ReviewForm({ productId, onSubmitted }) {
  const { user } = useAuth();
  const location = useLocation();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Only logged-in people can write reviews
  if (!user) {
    return (
      <p className="mt-6 text-gray-600">
        <Link
          to="/login"
          state={{ from: location.pathname }}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Log in
        </Link>{' '}
        to write a review.
      </p>
    );
  }

  if (done) {
    return (
      <div className="mt-6 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
        Thank you! Your review has been added.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please choose a star rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setSaving(true);
    try {
      await api.post(`/products/${productId}/reviews`, {
        rating,
        comment: comment.trim(),
      });
      setDone(true);
      onSubmitted();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not save your review. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const shown = hoverRating || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 bg-white rounded-xl shadow-sm p-6"
    >
      <h3 className="text-lg font-bold text-gray-800">Write a review</h3>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            className={`text-3xl ${
              star <= shown ? 'text-yellow-400' : 'text-gray-300'
            }`}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-500">{rating} out of 5</span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="What did you think of this product?"
        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Your review"
      />

      <button
        type="submit"
        disabled={saving}
        className="mt-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-6 py-2 rounded-lg"
      >
        {saving ? 'Saving...' : 'Submit review'}
      </button>
    </form>
  );
}

export default ReviewForm;