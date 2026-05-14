import React, { useEffect, useState } from 'react';
import type { CharityPost } from '../api/types';
import { charityPostAPI } from '../api/apis';
import './DonateModal.css';

interface DonateModalProps {
  post: CharityPost;
  onClose: () => void;
  onSuccess: (updatedPost: CharityPost) => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ post: initialPost, onClose, onSuccess }) => {
  const [post, setPost] = useState<CharityPost>(initialPost);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const response = await charityPostAPI.getPostById(initialPost.charityID);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching latest post data:', err);
        // Fallback to initialPost if fetch fails
      } finally {
        setFetching(false);
      }
    };
    fetchLatestPost();
  }, [initialPost.charityID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await charityPostAPI.donateToPost(post.charityID, numAmount);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min((post.currentAmount / post.amountNeeded) * 100, 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="donate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Donate to {post.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {fetching ? (
          <div className="modal-body">
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Fetching latest campaign status...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="current-progress-info">
                <div className="progress-stats">
                  <span>₱{post.currentAmount.toLocaleString()} raised</span>
                  <span>Goal: ₱{post.amountNeeded.toLocaleString()}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <p className="donation-instruction">
                Enter the amount you wish to donate to help {post.title} reach its goal.
              </p>

              <div className="input-group">
                <label htmlFor="amount">Donation Amount (₱)</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="confirm-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Confirm Donation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DonateModal;
