import React, { useState } from 'react';
import { charityPostAPI } from '../api/apis';
import './RateUserModal.css';

interface RateUserModalProps {
  postID?: string;
  donationID: string;
  targetName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RateUserModal: React.FC<RateUserModalProps> = ({ postID, donationID, targetName, onClose, onSuccess }) => {
  const [rating, setRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setLoading(true);
    setError(null);

    try {
      if (postID) {
        await charityPostAPI.rateDonor(postID, donationID, {
          rating,
          comment: comment || undefined
        });
      } else {
        const { ratingsAPI } = await import('../api/apis');
        await ratingsAPI.rate({
          donationID,
          rating,
          comment: comment || undefined
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hovered || rating;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rum" onClick={e => e.stopPropagation()}>
        <div className="rum-header">
          <h2 className="rum-title">Rate Donor</h2>
          <button className="rum-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rum-body">
            <div className="rum-donor-name">
              <div className="rum-donor-avatar">{targetName.charAt(0).toUpperCase()}</div>
              <div>
                <p className="rum-donor-label">Rating experience with</p>
                <p className="rum-donor-value">{targetName}</p>
              </div>
            </div>

            <div className="rum-stars-section">
              <p className="rum-stars-prompt">How would you rate this donor?</p>
              <div className="rum-stars" onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`rum-star ${star <= activeRating ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill={star <= activeRating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>
              {activeRating > 0 && (
                <p className="rum-rating-label">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][activeRating]}
                </p>
              )}
            </div>

            <div className="rum-field">
              <div className="rum-label-row">
                <label className="rum-label">Comment <span className="rum-optional">(optional)</span></label>
                <span className="rum-counter">{comment.length}/500</span>
              </div>
              <textarea
                className="rum-textarea"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share a short comment about this donation…"
                maxLength={500}
                rows={3}
              />
            </div>

            {error && <div className="rum-error">{error}</div>}
          </div>

          <div className="rum-footer">
            <button type="button" className="rum-btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="rum-btn-submit" disabled={loading || rating === 0}>
              {loading ? 'Submitting…' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateUserModal;
