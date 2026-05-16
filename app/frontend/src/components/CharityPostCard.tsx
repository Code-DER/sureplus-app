import React, { useState } from 'react';
import type { CharityPost } from '../api/types';
import DonationHistory from './DonationHistory';
import './CharityPostCard.css';

interface CharityPostCardProps {
  post: CharityPost;
  onDonate?: (post: CharityPost) => void;
  onViewProfile?: (userId: string) => void;
  isOwner?: boolean;
  onEdit?: (post: CharityPost) => void;
  onDelete?: (post: CharityPost) => void;
  onStatusChange?: (post: CharityPost, newStatus: 'active' | 'closed') => void;
}

const ProgressBar: React.FC<{
  label: string;
  current: number;
  goal: number;
  unit: string;
  unitPosition?: 'prefix' | 'suffix';
}> = ({ label, current, goal, unit, unitPosition = 'prefix' }) => {
  const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  
  const formatValue = (val: number) => {
    const formatted = val.toLocaleString();
    return unitPosition === 'prefix' ? `${unit}${formatted}` : `${formatted} ${unit}`;
  };

  return (
    <div className="charity-post-progress-section">
      <div className="progress-info">
        <span className="current-amount">{formatValue(current)}</span>
        <span className="target-amount">{label} Goal: {formatValue(goal)}</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="progress-footer">
        <span className="progress-percentage">{Math.round(progress)}% funded</span>
      </div>
    </div>
  );
};

const CharityPostCard: React.FC<CharityPostCardProps> = ({ 
  post, 
  onDonate, 
  onViewProfile,
  isOwner, 
  onEdit, 
  onDelete,
  onStatusChange
}) => {
  const [showDonations, setShowDonations] = useState(false);

  const isMoneyFunded = post.amountNeeded !== null && post.currentAmount >= post.amountNeeded;
  const isFoodFunded = post.foodGoalKg !== null && post.currentFoodKg >= post.foodGoalKg;
  
  // A post is fully funded if all enabled goals are met
  const isFullyFunded = (
    (post.donationMode === 'money' && isMoneyFunded) ||
    (post.donationMode === 'food' && isFoodFunded) ||
    (post.donationMode === 'both' && isMoneyFunded && isFoodFunded)
  );

  const isInteractionDisabled = post.status === 'closed' || post.status === 'funded' || isFullyFunded;

  return (
    <div className={`charity-post-card ${isFullyFunded ? 'is-funded' : ''}`}>
      {isFullyFunded && (
        <div className="funded-banner">
          <span className="celebration-emoji">🎉</span>
          Goal Reached!
        </div>
      )}
      <div className="charity-post-header">
        <div className="title-group">
          <div className="title-row">
            <h3 className="charity-post-title">{post.title}</h3>
            {post.isPartner && (
              <span className="partner-badge" title="Verified Partner Charity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Partner
              </span>
            )}
            <span className={`mode-badge ${post.donationMode}`}>
              {post.donationMode === 'money' ? '💰 Money' : post.donationMode === 'food' ? '🥕 Food' : '🤝 Both'}
            </span>
          </div>
          <span className={`status-badge ${post.status}`}>{post.status}</span>
        </div>
        {isOwner && (
          <div className="charity-post-actions">
            {post.status !== 'closed' ? (
              <button 
                className="action-btn close" 
                onClick={() => onStatusChange?.(post, 'closed')} 
                aria-label="Close Post"
                title="Close Post"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
              </button>
            ) : (
              <button 
                className="action-btn reopen" 
                onClick={() => onStatusChange?.(post, 'active')} 
                aria-label="Reopen Post"
                title="Reopen Post"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
            )}
            <button className="action-btn edit" onClick={() => onEdit?.(post)} aria-label="Edit Post" title="Edit Post">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button className="action-btn delete" onClick={() => onDelete?.(post)} aria-label="Delete Post" title="Delete Post">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {post.imageUrl && (
        <div className="charity-post-image">
          <img src={post.imageUrl} alt={post.title} />
        </div>
      )}

      <p className="charity-post-description">
        {post.description || 'No description provided.'}
      </p>

      <div className="progress-bars">
        {(post.donationMode === 'food' || post.donationMode === 'both') && post.foodGoalKg !== null && (
          <ProgressBar 
            label="Food"
            current={post.currentFoodKg}
            goal={post.foodGoalKg}
            unit="kg"
            unitPosition="suffix"
          />
        )}
      </div>

      <div className="charity-post-footer">
        {isOwner && (
          <button 
            className={`view-donations-btn ${showDonations ? 'active' : ''}`}
            onClick={() => setShowDonations(!showDonations)}
          >
            {showDonations ? 'Hide Donations' : 'View Donations'}
          </button>
        )}
        {!isOwner && onDonate && (
          <button 
            className="donate-btn" 
            onClick={() => onDonate(post)}
            disabled={isInteractionDisabled}
          >
            {isInteractionDisabled ? 'Goal Met' : 'Donate Now'}
          </button>
        )}
        {!isOwner && onViewProfile && (
          <button className="view-profile-btn" onClick={() => onViewProfile(post.userID)}>
            View Charity
          </button>
        )}
      </div>

      {isOwner && showDonations && (
        <div className="charity-post-donations-drawer">
          <DonationHistory postID={post.charityID} />
        </div>
      )}
    </div>
  );
};

export default CharityPostCard;
