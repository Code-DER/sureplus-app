import React, { useState, useEffect } from 'react';
import type { Donation } from '../api/types';
import { charityPostAPI } from '../api/apis';
import RateUserModal from './RateUserModal';
import './DonationHistory.css';

interface DonationHistoryProps {
  postID: string;
}

const DonationHistory: React.FC<DonationHistoryProps> = ({ postID }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingDonation, setRatingDonation] = useState<Donation | null>(null);

  const fetchDonations = async () => {
    try {
      const res = await charityPostAPI.getDonationsByPost(postID);
      setDonations(res.data);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [postID]);

  if (loading) return <div className="donation-history-loading">Loading donations...</div>;
  if (error) return <div className="donation-history-error">{error}</div>;

  return (
    <div className="donation-history-container">
      {donations.length === 0 ? (
        <p className="no-donations">No donations received for this post yet.</p>
      ) : (
        <div className="donation-list">
          {donations.map(donation => (
            <div key={donation.donationID} className="donation-item">
              <div className="donation-info">
                <span className="donor-name">{donation.donorName || 'Anonymous'}</span>
                <span className="donation-details">
                  {donation.donationType === 'money' 
                    ? `₱${donation.amount?.toLocaleString()}` 
                    : `${donation.foodKg}kg of food`}
                </span>
                <span className="donation-date">
                  {new Date(donation.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="donation-actions">
                {donation.userID && donation.status === 'completed' && !donation.isRated && (
                  <button 
                    className="rate-btn" 
                    onClick={() => setRatingDonation(donation)}
                    title="Rate this donor"
                  >
                    Rate Donor
                  </button>
                )}
                {donation.isRated && (
                  <span className="rated-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Rated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {ratingDonation && (
        <RateUserModal 
          postID={postID}
          donationID={ratingDonation.donationID}
          targetName={ratingDonation.donorName || 'Donor'}
          onClose={() => setRatingDonation(null)}
          onSuccess={() => {
            setRatingDonation(null);
            fetchDonations(); // Refresh list to maybe show "Rated" badge if we added one
          }}
        />
      )}
    </div>
  );
};

export default DonationHistory;
