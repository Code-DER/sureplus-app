import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { CharityProfile, CharityPost } from '../api/types';
import { charityAPI, charityPostAPI } from '../api/apis';
import CharityPostCard from './CharityPostCard';
import DonateModal from './DonateModal';
import './CharityProfileView.css';

interface CharityProfileViewProps {
  userId: string;
  onBack?: () => void;
}

const CharityProfileView: React.FC<CharityProfileViewProps> = ({ userId, onBack }) => {
  const [profile, setProfile] = useState<CharityProfile | null>(null);
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [stats, setStats] = useState<{ totalRaised: number, totalFoodKg: number, activeCount: number, fundedCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<CharityPost | null>(null);

  // Pagination
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const LIMIT = 6;

  const fetchCharityData = useCallback(async (isInitial = true) => {
    try {
      if (isInitial) {
        setLoading(true);
        offsetRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      const currentOffset = isInitial ? 0 : offsetRef.current;

      if (isInitial) {
        const [profileRes, postsRes, statsRes] = await Promise.all([
          charityAPI.getCharityById(userId),
          charityPostAPI.getPostsByUser(userId, { limit: LIMIT, offset: 0 }),
          charityPostAPI.getUserPostStats(userId)
        ]);

        setProfile(profileRes.data);
        setPosts(postsRes.data);
        setStats(statsRes.data);
        setHasMore(postsRes.data.length === LIMIT);
        offsetRef.current = LIMIT;
      } else {
        const postsRes = await charityPostAPI.getPostsByUser(userId, { limit: LIMIT, offset: currentOffset });
        const newPosts = postsRes.data;
        setPosts(prev => [...prev, ...newPosts]);
        setHasMore(newPosts.length === LIMIT);
        offsetRef.current = currentOffset + newPosts.length;
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching charity profile:', err);
      setError('Failed to load charity profile.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCharityData(true);
  }, [fetchCharityData]);

  const handleDonateSuccess = (updatedPost: CharityPost) => {
    setPosts(prev => prev.map(p => p.charityID === updatedPost.charityID ? updatedPost : p));
  };

  if (loading) return <div className="charity-profile-loading"><div className="spinner"></div></div>;
  if (error) return <div className="charity-profile-error"><p>{error}</p></div>;
  if (!profile) return <div className="charity-profile-error"><p>Charity not found.</p></div>;

  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `***@${domain}`;
    return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
  };

  const totalRaised = stats?.totalRaised || 0;
  const totalFood = stats?.totalFoodKg || 0;
  const activeCount = stats?.activeCount || 0;
  const fundedCount = stats?.fundedCount || 0;

  return (
    <div className="charity-profile-view">
      {onBack && (
        <button className="back-btn" onClick={onBack} aria-label="Go back to feed">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Feed
        </button>
      )}
      <header className="charity-profile-hero">
        <div className="profile-hero-content">
          <div className="charity-logo-large">
            {profile.organizationName[0]}
          </div>
          <div className="charity-info-text">
            <div className="charity-title-row">
              <h1>{profile.organizationName}</h1>
              {profile.isPartner && (
                <span className="partner-badge-large">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Verified Partner
                </span>
              )}
            </div>
            <p className="charity-meta">
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {profile.firstName} {profile.lastName}
              </span>
              <span className="meta-item" title="Email is masked for privacy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {maskEmail(profile.emailAddress)}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="charity-impact-summary">
        <div className="impact-stat">
          <span className="stat-value">₱{totalRaised.toLocaleString()}</span>
          <span className="stat-label">Total Raised</span>
        </div>
        <div className="impact-stat">
          <span className="stat-value">{totalFood.toFixed(1)}kg</span>
          <span className="stat-label">Food Received</span>
        </div>
        <div className="impact-stat">
          <span className="stat-value">{activeCount}</span>
          <span className="stat-label">Active Posts</span>
        </div>
        <div className="impact-stat">
          <span className="stat-value">{fundedCount}</span>
          <span className="stat-label">Funded Goals</span>
        </div>
      </div>

      <section className="charity-posts-section">
        <div className="section-header">
          <h2>Active Campaigns</h2>
          <p>Choose a campaign to support {profile.organizationName}.</p>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <p>This charity has no active donation posts at the moment.</p>
          </div>
        ) : (
          <div className="charity-posts-grid">
            {posts.map(post => (
              <CharityPostCard 
                key={post.charityID}
                post={post}
                onDonate={(p) => setSelectedPost(p)}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="profile-load-more" style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button 
              className="view-profile-btn" 
              onClick={() => fetchCharityData(false)}
              disabled={loadingMore}
              style={{ padding: '12px 32px' }}
            >
              {loadingMore ? 'Loading...' : 'Load More Campaigns'}
            </button>
          </div>
        )}
      </section>

      {selectedPost && (
        <DonateModal 
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onSuccess={handleDonateSuccess}
        />
      )}
    </div>
  );
};

export default CharityProfileView;
