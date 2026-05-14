import React, { useEffect, useState, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<CharityPost | null>(null);

  const fetchCharityData = useCallback(async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        charityAPI.getCharityById(userId),
        charityPostAPI.getPostsByUser(userId)
      ]);

      setProfile(profileRes.data);
      setPosts(postsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching charity profile:', err);
      setError('Failed to load charity profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const init = async () => {
      await fetchCharityData();
    };
    init();
  }, [fetchCharityData]);

  const handleDonateSuccess = (updatedPost: CharityPost) => {
    setPosts(prev => prev.map(p => p.charityID === updatedPost.charityID ? updatedPost : p));
  };

  if (loading) return <div className="charity-profile-loading"><div className="spinner"></div></div>;
  if (error) return <div className="charity-profile-error"><p>{error}</p></div>;
  if (!profile) return <div className="charity-profile-error"><p>Charity not found.</p></div>;

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
            <h1>{profile.organizationName}</h1>
            <p className="charity-meta">
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {profile.firstName} {profile.lastName}
              </span>
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {profile.emailAddress}
              </span>
            </p>
          </div>
        </div>
      </header>

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
