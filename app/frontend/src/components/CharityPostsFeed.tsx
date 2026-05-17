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

  const [search, setSearch] = useState('');
  const [filterMode] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
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
        search: search.trim() || undefined,
        donation_mode: filterMode === 'all' ? undefined : filterMode,
        status: filterStatus === 'all' ? undefined : filterStatus
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

  useEffect(() => {
    if (activeTab !== 'posts') return;
    const timer = setTimeout(() => {
      fetchPosts(true);
    }, search ? 500 : 0);
    return () => clearTimeout(timer);
  }, [activeTab, search, filterMode, filterStatus]);

  useEffect(() => {
    if (activeTab !== 'posts' || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchPosts(false);
      },
      { threshold: 1.0, rootMargin: '100px' }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [activeTab, hasMore, loading, loadingMore]);

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

  const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'funded', label: 'Funded' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="charity-posts-feed">
      {/* ── Header row ── */}
      <div className="feed-header-top">
        <div className="header-text">
          <h1>Charity Support</h1>
          <p>Support local organizations in their mission to reduce food waste and help the community.</p>
        </div>
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

      {activeTab === 'posts' && (
        <>
          {/* ── Search ── */}
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

          {/* ── Status filter pills ── */}
          <div className="feed-filters">
            <div className="filter-pills-container">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`filter-chip ${filterStatus === value ? 'active' : ''}`}
                  onClick={() => setFilterStatus(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Content ── */}
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

              <div ref={observerTarget} className="infinite-scroll-sentinel">
                {loadingMore && (
                  <div className="load-more-loader">
                    <span className="mini-spinner"></span>
                    Loading more campaigns...
                  </div>
                )}
                {!hasMore && posts.length > 0 && (
                  <p className="no-more-posts">You've reached the end of the list.</p>
                )}
              </div>
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
