import React from 'react';
import type { CharityPost } from '../api/types';
import './CharityPostCard.css';

interface CharityPostCardProps {
  post: CharityPost;
  onDonate?: (post: CharityPost) => void;
  onViewProfile?: (userId: string) => void;
  isOwner?: boolean;
  onEdit?: (post: CharityPost) => void;
  onDelete?: (post: CharityPost) => void;
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
  onDelete 
}) => {
  return (
    <div className="charity-post-card">
      <div className="charity-post-header">
        <div className="title-group">
          <h3 className="charity-post-title">{post.title}</h3>
          <span className={`status-badge ${post.status}`}>{post.status}</span>
        </div>
        {isOwner && (
          <div className="charity-post-actions">
            <button className="action-btn edit" onClick={() => onEdit?.(post)} aria-label="Edit Post">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button className="action-btn delete" onClick={() => onDelete?.(post)} aria-label="Delete Post">
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
        {(post.donationMode === 'money' || post.donationMode === 'both') && post.amountNeeded !== null && (
          <ProgressBar 
            label="Funds"
            current={post.currentAmount}
            goal={post.amountNeeded}
            unit="₱"
            unitPosition="prefix"
          />
        )}
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
        {!isOwner && onDonate && post.status === 'active' && (
          <button className="donate-btn" onClick={() => onDonate(post)}>
            Donate Now
          </button>
        )}
        {!isOwner && onViewProfile && (
          <button className="view-profile-btn" onClick={() => onViewProfile(post.userID)}>
            View Charity
          </button>
        )}
      </div>
    </div>
  );
};

export default CharityPostCard;
