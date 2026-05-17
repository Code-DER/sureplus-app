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
  const isFoodFunded  = post.foodGoalKg  !== null && post.currentFoodKg  >= post.foodGoalKg;

  const isFullyFunded = (
    (post.donationMode === 'money' && isMoneyFunded) ||
    (post.donationMode === 'food'  && isFoodFunded)  ||
    (post.donationMode === 'both'  && isMoneyFunded && isFoodFunded)
  );

  const isInteractionDisabled = post.status === 'closed' || post.status === 'funded' || isFullyFunded;

  const modeConfig = {
    food:  { label: 'Food Drive', emoji: '🥕', cls: 'food'  },
    money: { label: 'Fundraiser', emoji: '💰', cls: 'money' },
    both:  { label: 'Food & Funds', emoji: '🤝', cls: 'both' },
  };
  const { label, emoji, cls } = modeConfig[post.donationMode as keyof typeof modeConfig] ?? modeConfig.food;

  const foodProgress  = post.foodGoalKg   ? Math.min((post.currentFoodKg  / post.foodGoalKg)   * 100, 100) : 0;
  const moneyProgress = post.amountNeeded ? Math.min((post.currentAmount  / post.amountNeeded) * 100, 100) : 0;

  const displayStatus = post.status === 'active' && isFullyFunded ? 'funded' : post.status;

  return (
    <div className={`charity-post-card ${isFullyFunded ? 'is-funded' : ''}`}>

      {/* Diagonal ribbon for funded cards */}
      {isFullyFunded && (
        <div className="funded-ribbon">Goal Met</div>
      )}

      {/* Badges row */}
      <div className="card-badges-row">
        <div className="card-badges-left">
          <span className={`mode-badge ${cls}`}>
            {emoji} {label}
          </span>
          {post.isPartner && (
            <span className="partner-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Partner
            </span>
          )}
        </div>
        <span className={`status-pill ${displayStatus}`}>
          {displayStatus}
        </span>
      </div>

      {/* Owner controls */}
      {isOwner && (
        <div className="charity-post-actions">
          {post.status !== 'closed' ? (
            <button className="action-btn close" onClick={() => onStatusChange?.(post, 'closed')} title="Close Post">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
            </button>
          ) : (
            <button className="action-btn reopen" onClick={() => onStatusChange?.(post, 'active')} title="Reopen Post">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          )}
          <button className="action-btn edit" onClick={() => onEdit?.(post)} title="Edit Post">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button className="action-btn delete" onClick={() => onDelete?.(post)} title="Delete Post">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Title */}
      <h3 className="charity-post-title">{post.title}</h3>

      {/* Body: impact section for funded, image+desc for regular */}
      {isFullyFunded ? (
        <div className="impact-achieved-section">
          <div className="impact-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Impact Achieved
          </div>
          <p className="impact-text">This campaign has met its target!</p>
          {post.description && (
            <p className="impact-quote">"{post.description}"</p>
          )}
        </div>
      ) : (
        <>
          {post.imageUrl && (
            <div className="charity-post-image">
              <img src={post.imageUrl} alt={post.title} />
            </div>
          )}
          {post.description && (
            <p className="charity-post-description">{post.description}</p>
          )}
        </>
      )}

      {/* Progress bars (non-funded only) */}
      {!isFullyFunded && (
        <div className="progress-bars">
          {post.foodGoalKg !== null && (
            <div className="charity-post-progress-section">
              <div className="progress-info">
                <span className="current-amount">{post.currentFoodKg} kg</span>
                <span className="target-amount">Food Goal: {post.foodGoalKg} kg</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${foodProgress}%` }}></div>
              </div>
              <div className="progress-footer">
                <span className="progress-percentage">{Math.round(foodProgress)}% funded</span>
              </div>
            </div>
          )}
          {post.amountNeeded !== null && (
            <div className="charity-post-progress-section">
              <div className="progress-info">
                <span className="current-amount">₱{post.currentAmount.toLocaleString()}</span>
                <span className="target-amount">Goal: ₱{post.amountNeeded.toLocaleString()}</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${moneyProgress}%` }}></div>
              </div>
              <div className="progress-footer">
                <span className="progress-percentage">{Math.round(moneyProgress)}% funded</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer buttons */}
      <div className="charity-post-footer">
        {isOwner ? (
          <button
            className={`view-donations-btn ${showDonations ? 'active' : ''}`}
            onClick={() => setShowDonations(!showDonations)}
          >
            {showDonations ? 'Hide Donations' : 'View Donations'}
          </button>
        ) : (
          <>
            {onDonate && (
              <button
                className="donate-btn"
                onClick={() => onDonate(post)}
                disabled={isInteractionDisabled}
              >
                {isInteractionDisabled ? 'Goal Met' : 'Donate Now'}
              </button>
            )}
            {onViewProfile && (
              <button className="view-profile-btn" onClick={() => onViewProfile(post.userID)}>
                View Charity
              </button>
            )}
          </>
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
