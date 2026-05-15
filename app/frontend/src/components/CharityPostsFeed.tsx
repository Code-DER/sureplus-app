import React, { useEffect, useState, useRef } from 'react';
import type { CharityPost } from '../api/types';
import { charityPostAPI } from '../api/apis';
import CharityPostCard from './CharityPostCard';
import DonateModal from './DonateModal';
import CharityProfileView from './CharityProfileView';
import CharityDirectory from './CharityDirectory';
import './CharityPostsFeed.css';

const CharityPostsFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'directory'>('posts');
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<CharityPost | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  // Pagination & Search
  const [search, setSearch] = useState('');
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 6;

  const fetchPosts = async (isInitial = true) => {
    try {
      if (isInitial) {
        setLoading(true);
        offsetRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      const currentOffset = isInitial ? 0 : offsetRef.current;
      const response = await charityPostAPI.getAllPosts({
        limit: LIMIT,
        offset: currentOffset,
        search: search.trim() || undefined
      });

      const newPosts = response.data;
      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === LIMIT);
      offsetRef.current = currentOffset + newPosts.length;
      setError(null);
    } catch (err) {
      setError('Failed to load charity posts. Please try again later.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle search and tab switch with a single effect to avoid double fetch
  useEffect(() => {
    if (activeTab !== 'posts') return;
    
    const timer = setTimeout(() => {
      fetchPosts(true);
    }, search ? 500 : 0);
    
    return () => clearTimeout(timer);
  }, [activeTab, search]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(false);
    }
  };

  const handleDonateSuccess = (updatedPost: CharityPost) => {
    setPosts(prevPosts => 
      prevPosts.map(p => p.charityID === updatedPost.charityID ? updatedPost : p)
    );
  };

  if (profileUserId) {
    return (
      <CharityProfileView 
        userId={profileUserId} 
        onBack={() => setProfileUserId(null)} 
      />
    );
  }

  return (
    <div className="charity-posts-feed">
      <div className="feed-header">
        <div className="header-text">
          <h2>Charity Support</h2>
          <p>Support local organizations in their mission to reduce food waste and help the community.</p>
        </div>
        
        <div className="header-actions">
          {activeTab === 'posts' && (
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <div className="feed-tabs">
            <button 
              className={`feed-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Donation Posts
            </button>
            <button 
              className={`feed-tab ${activeTab === 'directory' ? 'active' : ''}`}
              onClick={() => setActiveTab('directory')}
            >
              Organizations
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'posts' ? (
        <>
          {loading ? (
            <div className="charity-feed-loading">
              <div className="spinner"></div>
              <p>Loading donation posts...</p>
            </div>
          ) : error ? (
            <div className="charity-feed-error">
              <p>{error}</p>
              <button onClick={() => fetchPosts(true)}>Retry</button>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
              <h3>{search ? 'No matches found' : 'No donation posts yet'}</h3>
              <p>{search ? 'Try adjusting your search terms.' : 'Check back later for new opportunities to make an impact.'}</p>
              {search && <button className="clear-search" onClick={() => setSearch('')}>Clear Search</button>}
            </div>
          ) : (
            <>
              <div className="posts-grid">
                {posts.map(post => (
                  <CharityPostCard 
                    key={post.charityID} 
                    post={post} 
                    onDonate={(p) => setSelectedPost(p)}
                    onViewProfile={setProfileUserId}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="load-more-container">
                  <button 
                    className="load-more-btn" 
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className="mini-spinner"></span>
                        Loading...
                      </>
                    ) : 'Load More Campaigns'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <CharityDirectory onViewProfile={setProfileUserId} />
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
