import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import type { CharityProfile, CharityPost } from '../types/charity';
import type { User } from '../types/user';
import DonateModal from './DonateModal';
import './CharityDetailView.css';

interface CharityDetailViewProps {
  charityUserId: string;
  onBack: () => void;
  user: User | null;
}

export default function CharityDetailView({ charityUserId, onBack, user }: CharityDetailViewProps) {
  const [profile, setProfile] = useState<CharityProfile | null>(null);
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<CharityPost | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileData, postsData] = await Promise.all([
          apiGet<CharityProfile>(`/charities/${charityUserId}`),
          apiGet<CharityPost[]>(`/charity-posts/by-user/${charityUserId}`),
        ]);
        setProfile(profileData);
        setPosts(postsData);
      } catch (err) {
        console.error('Failed to fetch charity details:', err);
        setError('Failed to load charity information.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [charityUserId]);

  const handleDonateSuccess = (updatedPost: CharityPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.charityID === updatedPost.charityID ? updatedPost : p))
    );
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="charity-detail-loading">
        <div className="spinner"></div>
        <p>Loading charity details...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="charity-detail-error">
        <p>{error || 'Charity not found'}</p>
        <button onClick={onBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="charity-detail-container">
      <div className="charity-detail-header-nav">
        <button className="btn-back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Charities
        </button>
      </div>

      <header className="charity-profile-hero">
        <div className="charity-avatar-large">
          {profile.organizationName.charAt(0)}
        </div>
        <div className="charity-info">
          <h1>{profile.organizationName}</h1>
          <div className="charity-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{profile.city}, {profile.barangay}</span>
          </div>
          <p className="charity-bio">
            {profile.description || "We are dedicated to reducing food waste and supporting our community. Your donations help us continue our mission and reach more people in need."}
          </p>
        </div>
      </header>

      <section className="charity-posts-section">
        <div className="section-header">
          <h2>Active Fundraising</h2>
          <p>Support our current causes and help make an impact.</p>
        </div>

        {posts.length === 0 ? (
          <div className="no-posts-container">
            <p className="no-posts">No active fundraising posts at the moment.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => {
              const progress = Math.min(100, (post.currentAmount / post.amountNeeded) * 100);
              const isGoalReached = post.currentAmount >= post.amountNeeded;

              return (
                <div key={post.charityID} className="post-card">
                  <div className="post-card-body">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-description">{post.description}</p>
                    
                    <div className="post-progress-area">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className={`progress-bar-fill ${isGoalReached ? 'goal-reached' : ''}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="progress-stats">
                        <div className="stat-item">
                          <span className="stat-label">Raised</span>
                          <span className="stat-value">₱{post.currentAmount.toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Goal</span>
                          <span className="stat-value">₱{post.amountNeeded.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="post-card-footer">
                    {user?.role === 'buyer' && (
                      <button 
                        className={`btn-donate-action ${isGoalReached ? 'btn-goal-reached' : ''}`}
                        onClick={() => setSelectedPost(post)}
                        disabled={isGoalReached}
                      >
                        {isGoalReached ? 'Goal Reached!' : 'Donate Now'}
                      </button>
                    )}
                    {user?.role !== 'buyer' && !isGoalReached && (
                      <p className="role-restriction-notice">Switch to Buyer role to donate</p>
                    )}
                    {isGoalReached && user?.role !== 'buyer' && (
                      <button className="btn-donate-action btn-goal-reached" disabled>Goal Reached!</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedPost && (
        <DonateModal
          charityPostId={selectedPost.charityID}
          postTitle={selectedPost.title}
          currentAmount={selectedPost.currentAmount}
          amountNeeded={selectedPost.amountNeeded}
          onClose={() => setSelectedPost(null)}
          onSuccess={handleDonateSuccess}
        />
      )}
    </div>
  );
}
