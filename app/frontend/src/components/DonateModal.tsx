import { useState } from 'react';
import { apiPost } from '../api/client';
import type { CharityPost } from '../types/charity';
import './DonateModal.css';

interface DonateModalProps {
  charityPostId: string;
  postTitle: string;
  currentAmount: number;
  amountNeeded: number;
  onClose: () => void;
  onSuccess: (updatedPost: CharityPost) => void;
}

export default function DonateModal({
  charityPostId,
  postTitle,
  currentAmount,
  amountNeeded,
  onClose,
  onSuccess,
}: DonateModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = parseFloat(amount);

    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedPost = await apiPost<CharityPost>(`/charity-posts/${charityPostId}/donate`, {
        amount: donationAmount,
      });
      onSuccess(updatedPost);
    } catch (err) {
      console.error('Donation failed:', err);
      setError('Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const remaining = Math.max(0, amountNeeded - currentAmount);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="donate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="donate-modal-header">
          <h2>Donate to Cause</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="donate-modal-body">
          <p className="donate-subtitle">Supporting:</p>
          <h3 className="post-title-highlight">{postTitle}</h3>
          
          <div className="donation-stats">
            <div className="stat">
              <span className="label">Goal</span>
              <span className="value">₱{amountNeeded.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="label">Raised</span>
              <span className="value">₱{currentAmount.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="label">Remaining</span>
              <span className="value">₱{remaining.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="donate-form">
            <div className="input-group">
              <label htmlFor="amount">Enter Amount (PHP)</label>
              <div className="currency-input">
                <span className="currency-symbol">₱</span>
                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="1"
                  autoFocus
                  required
                />
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="btn-confirm-donate" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Donation'}
            </button>
          </form>
        </div>

        <div className="donate-modal-footer">
          <p>Your donation directly supports the charity organization. Thank you for your kindness!</p>
        </div>
      </div>
    </div>
  );
}
