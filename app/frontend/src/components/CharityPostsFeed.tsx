import React, { useEffect, useState } from 'react';
import type { CharityPost } from '../api/types';
import { charityPostAPI } from '../api/apis';
import CharityPostCard from './CharityPostCard';
import DonateModal from './DonateModal';
import './CharityPostsFeed.css';

const CharityPostsFeed: React.FC = () => {
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<CharityPost | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await charityPostAPI.getAllPosts();
      setPosts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load charity posts. Please try again later.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchPosts();
    };
    init();
  }, []);

  const handleDonateSuccess = (updatedPost: CharityPost) => {
    setPosts(prevPosts => 
      prevPosts.map(p => p.charityID === updatedPost.charityID ? updatedPost : p)
    );
  };

  if (loading) {
    return (
      <div className="charity-feed-loading">
        <div className="spinner"></div>
        <p>Loading donation posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charity-feed-error">
        <p>{error}</p>
        <button onClick={() => { setLoading(true); fetchPosts(); }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="charity-posts-feed">
      <div className="feed-header">
        <h2>Charity Donation Posts</h2>
        <p>Support local organizations in their mission to reduce food waste and help the community.</p>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1">
            <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
          </svg>
          <h3>No donation posts yet</h3>
          <p>Check back later for new opportunities to make an impact.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <CharityPostCard 
              key={post.charityID} 
              post={post} 
              onDonate={(p) => setSelectedPost(p)}
            />
          ))}
        </div>
      )}

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

export default CharityPostsFeed;
