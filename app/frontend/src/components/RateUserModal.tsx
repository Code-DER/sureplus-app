import React, { useState } from 'react';
import { ratingsAPI } from '../api/apis';
import './RateUserModal.css';

interface RateUserModalProps {
  donationID: string;
  targetName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RateUserModal: React.FC<RateUserModalProps> = ({ donationID, targetName, onClose, onSuccess }) => {
  const [rating, setRating] = useState<number>(5); // Default to thumbs up (5)
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ratingsAPI.rate({
        donationID,
        rating,
        comment: comment || undefined
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rate-user-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rate Donor</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="rate-prompt">How was your experience with <strong>{targetName}</strong>?</p>
            
            <div className="thumbs-container">
              <button 
                type="button" 
                className={`thumb-btn up ${rating === 5 ? 'active' : ''}`}
                onClick={() => setRating(5)}
              >
                <span className="thumb-icon">👍</span>
                <span className="thumb-label">Thumbs Up</span>
              </button>
              <button 
                type="button" 
                className={`thumb-btn down ${rating === 1 ? 'active' : ''}`}
                onClick={() => setRating(1)}
              >
                <span className="thumb-icon">👎</span>
                <span className="thumb-label">Thumbs Down</span>
              </button>
            </div>

            <div className="form-group">
              <label>Comment (Optional)</label>
              <textarea 
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share a short comment about the donation..."
                maxLength={500}
                rows={4}
              />
              <span className="char-count">{comment.length}/500</span>
            </div>

            {error && <p className="modal-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="confirm-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateUserModal;
