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
                {donation.userID && donation.status === 'completed' && (
                  <button 
                    className="rate-btn" 
                    onClick={() => setRatingDonation(donation)}
                    title="Rate this donor"
                  >
                    Rate Donor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {ratingDonation && (
        <RateUserModal 
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
