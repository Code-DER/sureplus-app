import { useState, useEffect, useRef } from 'react';
import type { CharityProfile, CharityPost } from '../api/types';
import { charityAPI, charityPostAPI, uploadsAPI } from '../api/apis';
import CharityPostCard from './CharityPostCard';
import UserAvatar from './UserAvatar';
import './CharityDashboard.css';

interface CharityDashboardProps {
  onSwitchRole: () => void;
}

const CharityDashboard: React.FC<CharityDashboardProps> = ({ onSwitchRole }) => {
  const [profile, setProfile] = useState<CharityProfile | null>(null);
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [stats, setStats] = useState<{ totalRaised: number, totalFoodKg: number, activeCount: number, fundedCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const LIMIT = 6;

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<CharityPost | null>(null);

  const fetchData = async (isInitial = true) => {
    try {
      if (isInitial) {
        setLoading(true);
        offsetRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      const currentOffset = isInitial ? 0 : offsetRef.current;

      if (isInitial) {
        const profileRes = await charityAPI.getMyCharityProfile();
        const charityProfile = profileRes.data;
        setProfile(charityProfile);

        // Parallel fetch for stats and first page of posts
        const [postsRes, statsRes] = await Promise.all([
          charityPostAPI.getPostsByUser(charityProfile.userID, { limit: LIMIT, offset: 0 }),
          charityPostAPI.getUserPostStats(charityProfile.userID)
        ]);

        setPosts(postsRes.data);
        setStats(statsRes.data);
        setHasMore(postsRes.data.length === LIMIT);
        offsetRef.current = LIMIT;
      } else if (profile) {
        const postsRes = await charityPostAPI.getPostsByUser(profile.userID, { limit: LIMIT, offset: currentOffset });
        const newPosts = postsRes.data;
        setPosts(prev => [...prev, ...newPosts]);
        setHasMore(newPosts.length === LIMIT);
        offsetRef.current = currentOffset + newPosts.length;
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching charity data:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePost = async (post: CharityPost) => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) return;

    try {
      await charityPostAPI.deletePost(post.charityID);
      setPosts(prev => prev.filter(p => p.charityID !== post.charityID));
    } catch {
      alert('Failed to delete post.');
    }
  };

  const handleStatusChange = async (post: CharityPost, newStatus: 'active' | 'closed') => {
    try {
      await charityPostAPI.updatePost(post.charityID, { status: newStatus });
      setPosts(prev => prev.map(p => p.charityID === post.charityID ? { ...p, status: newStatus } : p));
    } catch {
      alert(`Failed to ${newStatus === 'closed' ? 'close' : 'reopen'} post.`);
    }
  };

  if (loading) return <div className="charity-dashboard-loading"><div className="spinner"></div></div>;
  if (error) return <div className="charity-dashboard-error"><p>{error}</p><button onClick={() => { setLoading(true); fetchData(); }}>Retry</button></div>;

  const totalRaised = stats?.totalRaised || 0;
  const totalFoodDonated = stats?.totalFoodKg || 0;
  const activePostsCount = stats?.activeCount || 0;
  const fundedPostsCount = stats?.fundedCount || 0;

  return (
    <div className="charity-dashboard-page">
      <header className="charity-dashboard-header">
        <div className="header-left">
          <h1>{profile?.organizationName || 'Charity Dashboard'}</h1>
          <p>Manage your donation posts and track community support.</p>
        </div>
        <div className="header-right">
          <button className="switch-role-btn" onClick={onSwitchRole}>Switch to Buyer</button>
          <UserAvatar
            firstName={profile?.firstName}
            lastName={profile?.lastName}
            size={33}
            className="charity-header-avatar"
          />
        </div>
      </header>

      <main className="charity-dashboard-main">
        <section className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon raised">₱</div>
            <div className="stat-info">
              <span className="stat-label">Total Raised</span>
              <span className="stat-value">₱{totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon donated">🥗</div>
            <div className="stat-info">
              <span className="stat-label">Food Donated</span>
              <span className="stat-value">{totalFoodDonated.toFixed(1)} kg</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">📢</div>
            <div className="stat-info">
              <span className="stat-label">Active Posts</span>
              <span className="stat-value">{activePostsCount}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon funded">🎉</div>
            <div className="stat-info">
              <span className="stat-label">Funded Posts</span>
              <span className="stat-value">{fundedPostsCount}</span>
            </div>
          </div>
        </section>

        <section className="dashboard-actions">
          <button className="create-post-btn" onClick={() => setShowCreateModal(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Post
          </button>
        </section>

        <section className="posts-section">
          <h2>Your Donation Posts</h2>
          {posts.length === 0 ? (
            <div className="empty-posts">
              <p>You haven't created any donation posts yet.</p>
              <button onClick={() => setShowCreateModal(true)}>Create your first post</button>
            </div>
          ) : (
            <div className="charity-posts-grid">
              {posts.map(post => (
                <CharityPostCard 
                  key={post.charityID}
                  post={post}
                  isOwner={true}
                  onEdit={(p) => setEditingPost(p)}
                  onDelete={handleDeletePost}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="dashboard-load-more">
              <button 
                className="load-more-btn" 
                onClick={() => fetchData(false)}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </section>
      </main>

      {showCreateModal && (
        <CreateCharityPostModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }} 
        />
      )}

      {editingPost && (
        <EditCharityPostModal 
          post={editingPost}
          onClose={() => setEditingPost(null)} 
          onSuccess={() => {
            setEditingPost(null);
            fetchData();
          }} 
        />
      )}
    </div>
  );
};

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCharityPostModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    imageUrl: string;
    donationMode: 'money' | 'food' | 'both';
    amountNeeded: string;
    foodGoalKg: string;
  }>({ 
    title: '', 
    description: '', 
    imageUrl: '',
    donationMode: 'money',
    amountNeeded: '',
    foodGoalKg: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await uploadsAPI.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { title, donationMode, amountNeeded, foodGoalKg } = formData;
    
    if (!title) {
      setError('Title is required.');
      return;
    }

    if ((donationMode === 'money' || donationMode === 'both') && !amountNeeded) {
      setError('Amount Needed is required.');
      return;
    }

    if ((donationMode === 'food' || donationMode === 'both') && !foodGoalKg) {
      setError('Food Goal is required.');
      return;
    }

    setLoading(true);
    try {
      await charityPostAPI.createPost({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
        donationMode: formData.donationMode,
        amountNeeded: (donationMode === 'money' || donationMode === 'both') ? parseFloat(amountNeeded) : undefined,
        foodGoalKg: (donationMode === 'food' || donationMode === 'both') ? parseFloat(foodGoalKg) : undefined
      });
      onSuccess();
    } catch {
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="charity-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Donation Post</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g., Community Soup Kitchen Fund"
                required 
              />
            </div>
            <div className="form-group">
              <div className="label-with-counter">
                <label>Description (Optional)</label>
                <span className={`char-counter ${formData.description.length > 1000 ? 'error' : ''}`}>
                  {formData.description.length}/1000
                </span>
              </div>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Describe what this donation will be used for..."
                maxLength={1000}
              />
            </div>

            <div className="form-group">
              <label>Post Image</label>
              <div className="file-upload-container">
                {formData.imageUrl && (
                  <div className="image-preview">
                    <img src={formData.imageUrl} alt="Preview" />
                    <button type="button" className="remove-img-btn" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}>&times;</button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                {!formData.imageUrl && (
                  <button type="button" className="upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Donation Mode</label>
              <select 
                value={formData.donationMode} 
                onChange={e => setFormData({...formData, donationMode: e.target.value as 'money' | 'food' | 'both'})}
                disabled={true}
              >
                <option value="food">Food only</option>
                <option value="money" disabled>Money only (Coming Soon)</option>
                <option value="both" disabled>Money + Food (Coming Soon)</option>
              </select>
            </div>
            {(formData.donationMode === 'money' || formData.donationMode === 'both') && (
              <div className="form-group">
                <label>Amount Needed (₱)</label>
                <input 
                  type="number" 
                  value={formData.amountNeeded} 
                  onChange={e => setFormData({...formData, amountNeeded: e.target.value})} 
                  placeholder="0.00"
                  min="1"
                  required 
                />
              </div>
            )}

            {(formData.donationMode === 'food' || formData.donationMode === 'both') && (
              <div className="form-group">
                <label>Food Goal (kg)</label>
                <input 
                  type="number" 
                  value={formData.foodGoalKg} 
                  onChange={e => setFormData({...formData, foodGoalKg: e.target.value})} 
                  placeholder="0.00"
                  min="0.1"
                  step="0.1"
                  required 
                />
              </div>
            )}

            {error && <p className="modal-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="confirm-btn" disabled={loading || uploading || formData.description.length > 1000}>
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditModalProps extends ModalProps {
  post: CharityPost;
}

const EditCharityPostModal: React.FC<EditModalProps> = ({ post, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ 
    title: post.title, 
    description: post.description || '', 
    imageUrl: post.imageUrl || '',
    amountNeeded: post.amountNeeded?.toString() || '',
    foodGoalKg: post.foodGoalKg?.toString() || '',
    status: post.status
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await uploadsAPI.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await charityPostAPI.updatePost(post.charityID, {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        amountNeeded: (post.donationMode === 'money' || post.donationMode === 'both') ? parseFloat(formData.amountNeeded) : undefined,
        foodGoalKg: (post.donationMode === 'food' || post.donationMode === 'both') ? parseFloat(formData.foodGoalKg) : undefined,
        status: formData.status
      });
      onSuccess();
    } catch {
      setError('Failed to update post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="charity-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Donation Post</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <div className="label-with-counter">
                <label>Description (Optional)</label>
                <span className={`char-counter ${formData.description.length > 1000 ? 'error' : ''}`}>
                  {formData.description.length}/1000
                </span>
              </div>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                maxLength={1000}
              />
            </div>

            <div className="form-group">
              <label>Post Image</label>
              <div className="file-upload-container">
                {formData.imageUrl && (
                  <div className="image-preview">
                    <img src={formData.imageUrl} alt="Preview" />
                    <button type="button" className="remove-img-btn" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}>&times;</button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                {!formData.imageUrl && (
                  <button type="button" className="upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'funded' | 'closed'})}
              >
                <option value="active">Active</option>
                <option value="funded">Funded</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {(post.donationMode === 'money' || post.donationMode === 'both') && (
              <div className="form-group">
                <label>Amount Needed (₱)</label>
                <input 
                  type="number" 
                  value={formData.amountNeeded} 
                  onChange={e => setFormData({...formData, amountNeeded: e.target.value})} 
                  min="1"
                  required 
                />
              </div>
            )}

            {(post.donationMode === 'food' || post.donationMode === 'both') && (
              <div className="form-group">
                <label>Food Goal (kg)</label>
                <input 
                  type="number" 
                  value={formData.foodGoalKg} 
                  onChange={e => setFormData({...formData, foodGoalKg: e.target.value})} 
                  min="0.1"
                  step="0.1"
                  required 
                />
              </div>
            )}

            {error && <p className="modal-error">{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="confirm-btn" disabled={loading || uploading || formData.description.length > 1000}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharityDashboard;
