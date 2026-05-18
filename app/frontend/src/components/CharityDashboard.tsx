import { useState, useEffect, useRef, useCallback } from 'react';
import type { CharityProfile, CharityPost } from '../api/types';
import { charityAPI, charityPostAPI, uploadsAPI } from '../api/apis';
import CharityPostCard from './CharityPostCard';
import ProfileView from './ProfileView';
import NotificationBell from './NotificationBell';
import Toast, { type ToastItem } from './Toast';
import './CharityDashboard.css';

type CharityTab = 'dashboard' | 'profile';

const CharityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CharityTab>('dashboard');
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingPost, setEditingPost] = useState<CharityPost | null>(null);

  // Toast
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  }, []);

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

  const totalFoodDonated = stats?.totalFoodKg || 0;
  const activePostsCount = stats?.activeCount || 0;

  const familiesHelped = Math.floor(totalFoodDonated * 2);

  return (
    <div className="charity-dashboard-layout">

      {/* ── Sidebar ── */}
      <aside className="charity-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span className="sidebar-logo-letter">S</span>
          </div>
          <div className="sidebar-brand-text">
            <h2>{profile?.organizationName || profile?.firstName || 'Sureplus'}</h2>
            <span>Charity Portal</span>
          </div>
          <NotificationBell buttonClassName="sidebar-footer-icon-btn">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 17V15H4V8C4 6.61667 4.4167 5.3875 5.25 4.3125C6.0833 3.2375 7.1667 2.5333 8.5 2.2V1.5C8.5 1.0833 8.6458 0.7292 8.9375 0.4375C9.2292 0.1458 9.5833 0 10 0C10.4167 0 10.7708 0.1458 11.0625 0.4375C11.3542 0.7292 11.5 1.0833 11.5 1.5V2.2C12.8333 2.5333 13.9167 3.2375 14.75 4.3125C15.5833 5.3875 16 6.6167 16 8V15H18V17H2ZM10 20C9.45 20 8.9792 19.8042 8.5875 19.4125C8.1958 19.0208 8 18.55 8 18H12C12 18.55 11.8042 19.0208 11.4125 19.4125C11.0208 19.8042 10.55 20 10 20ZM6 15H14V8C14 6.9 13.6083 5.9583 12.825 5.175C12.0417 4.3917 11.1 4 10 4C8.9 4 7.9583 4.3917 7.175 5.175C6.3917 5.9583 6 6.9 6 8V15Z" />
            </svg>
          </NotificationBell>
        </div>

        <button className="btn-add-listing" onClick={() => setShowCreateModal(true)}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M8.5 1v15M1 8.5h15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Post Request
        </button>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="sidebar-link-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="0" y="0" width="8" height="6" rx="1" fill="currentColor"/>
                <rect x="10" y="0" width="8" height="8" rx="1" fill="currentColor"/>
                <rect x="0" y="8" width="8" height="10" rx="1" fill="currentColor"/>
                <rect x="10" y="10" width="8" height="8" rx="1" fill="currentColor"/>
              </svg>
            </span>
            Dashboard
          </button>
          <button
            className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="sidebar-link-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            Profile
          </button>
        </nav>

        {/* Edit Org at the bottom of the sidebar */}
        <div className="sidebar-footer-actions">
          <button className="sidebar-edit-org-btn" onClick={() => setShowProfileModal(true)}>
            Edit Org
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="charity-dashboard-main">

        {activeTab === 'dashboard' && (
          <div className="charity-content-card">
            {/* Page header */}
            <div className="dashboard-overview-header">
              <div>
                <h1 className="overview-title">Overview</h1>
                <p className="overview-subtitle">Welcome back, {profile?.organizationName || profile?.firstName}!</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="overview-stats-row">
              <div className="food-donated-card">
                <div className="food-donated-left">
                  <span className="food-donated-value">{totalFoodDonated.toFixed(1)} kg</span>
                  <span className="food-donated-sub">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 11l19-9-9 19-2-8-8-2z"></path>
                    </svg>
                    {familiesHelped} families helped
                  </span>
                </div>
                <div className="food-donated-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                    <path d="M7 2v20"></path>
                    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                  </svg>
                </div>
              </div>

              <div className="active-posts-card">
                <span className="active-posts-label">ACTIVE POSTS</span>
                <span className="active-posts-value">{activePostsCount}</span>
                <span className="active-posts-sub">{posts.length} existing donations</span>
              </div>
            </div>

            {/* Posts section */}
            <section className="posts-section">
              <div className="posts-section-header">
                <div>
                  <h2 className="posts-section-title">Your Donation Posts</h2>
                  <p className="posts-section-sub">Manage and monitor your active community requests.</p>
                </div>
                <button className="create-post-btn" onClick={() => setShowCreateModal(true)}>
                  + Create New Post
                </button>
              </div>

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
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="charity-content-card">
            <ProfileView />
          </div>
        )}
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

      {showProfileModal && profile && (
        <CharityProfileModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSuccess={() => {
            setShowProfileModal(false);
            fetchData();
            addToast('Organization profile updated successfully!');
          }}
        />
      )}

      <Toast toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

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

interface CharityProfileModalProps extends ModalProps {
  profile: CharityProfile;
}

const CharityProfileModal: React.FC<CharityProfileModalProps> = ({ profile, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organizationName: profile.organizationName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phoneNumber: profile.phoneNumber || '',
    street: profile.street || '',
    barangay: profile.barangay || '',
    city: profile.city || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await charityAPI.updateMyCharityProfile(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cfm" onClick={e => e.stopPropagation()}>
        <div className="cfm-header">
          <div>
            <h2 className="cfm-title">Edit Organization</h2>
            <p className="cfm-subtitle">Update your charity's profile information</p>
          </div>
          <button className="cfm-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cfm-body">

            <div className="cfm-section">
              <span className="cfm-section-label">Organization Info</span>
              <div className="cfm-field">
                <label className="cfm-label">Organization Name</label>
                <input className="cfm-input" type="text" value={formData.organizationName}
                  onChange={e => setFormData({...formData, organizationName: e.target.value})}
                  placeholder="e.g., Gojo Community Center" required />
              </div>
              <div className="cfm-grid-2">
                <div className="cfm-field">
                  <label className="cfm-label">First Name</label>
                  <input className="cfm-input" type="text" value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="cfm-field">
                  <label className="cfm-label">Last Name</label>
                  <input className="cfm-input" type="text" value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                </div>
              </div>
            </div>

            <div className="cfm-section">
              <span className="cfm-section-label">Contact & Address</span>
              <div className="cfm-field">
                <label className="cfm-label">Phone Number</label>
                <input className="cfm-input" type="text" value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="e.g., 09123456789" />
              </div>
              <div className="cfm-field">
                <label className="cfm-label">Street / Address</label>
                <input className="cfm-input" type="text" value={formData.street}
                  onChange={e => setFormData({...formData, street: e.target.value})} />
              </div>
              <div className="cfm-grid-2">
                <div className="cfm-field">
                  <label className="cfm-label">Barangay</label>
                  <input className="cfm-input" type="text" value={formData.barangay}
                    onChange={e => setFormData({...formData, barangay: e.target.value})} />
                </div>
                <div className="cfm-field">
                  <label className="cfm-label">City</label>
                  <input className="cfm-input" type="text" value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
              </div>
            </div>

            {error && <div className="cfm-error">{error}</div>}
          </div>

          <div className="cfm-footer">
            <button type="button" className="cfm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="cfm-btn-submit green" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
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
    donationMode: 'food',
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
      <div className="cfm" onClick={e => e.stopPropagation()}>
        <div className="cfm-header">
          <div>
            <h2 className="cfm-title">Create Donation Post</h2>
            <p className="cfm-subtitle">Share your community request with donors</p>
          </div>
          <button className="cfm-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cfm-body">

            <div className="cfm-section">
              <span className="cfm-section-label">Post Details</span>
              <div className="cfm-field">
                <label className="cfm-label">Title <span className="cfm-required">*</span></label>
                <input className="cfm-input" type="text" value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Community Soup Kitchen Fund" required />
              </div>
              <div className="cfm-field">
                <div className="cfm-label-row">
                  <label className="cfm-label">Description</label>
                  <span className={`cfm-counter ${formData.description.length > 1000 ? 'over' : ''}`}>
                    {formData.description.length}/1000
                  </span>
                </div>
                <textarea className="cfm-textarea" value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what this donation will be used for…"
                  maxLength={1000} rows={4} />
              </div>
              <div className="cfm-field">
                <label className="cfm-label">Food Goal (kg) <span className="cfm-required">*</span></label>
                <input className="cfm-input" type="number" value={formData.foodGoalKg}
                  onChange={e => setFormData({...formData, foodGoalKg: e.target.value})}
                  placeholder="e.g., 50" min="0.1" step="0.1" required />
              </div>
            </div>

            <div className="cfm-section">
              <span className="cfm-section-label">Post Image</span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
              {formData.imageUrl ? (
                <div className="cfm-image-preview">
                  <img src={formData.imageUrl} alt="Preview" />
                  <button type="button" className="cfm-remove-img" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}>
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/>
                    </svg>
                    Remove
                  </button>
                </div>
              ) : (
                <button type="button" className="cfm-upload-area" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>{uploading ? 'Uploading…' : 'Click to upload image'}</span>
                  <span className="cfm-upload-hint">PNG, JPG up to 10MB</span>
                </button>
              )}
            </div>

            {error && <div className="cfm-error">{error}</div>}
          </div>

          <div className="cfm-footer">
            <button type="button" className="cfm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="cfm-btn-submit orange" disabled={loading || uploading || formData.description.length > 1000}>
              {loading ? 'Creating…' : '+ Create Post'}
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
      <div className="cfm" onClick={e => e.stopPropagation()}>
        <div className="cfm-header">
          <div>
            <h2 className="cfm-title">Edit Donation Post</h2>
            <p className="cfm-subtitle">Update your post details</p>
          </div>
          <button className="cfm-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cfm-body">

            <div className="cfm-section">
              <span className="cfm-section-label">Post Details</span>
              <div className="cfm-field">
                <label className="cfm-label">Title <span className="cfm-required">*</span></label>
                <input className="cfm-input" type="text" value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="cfm-field">
                <div className="cfm-label-row">
                  <label className="cfm-label">Description</label>
                  <span className={`cfm-counter ${formData.description.length > 1000 ? 'over' : ''}`}>
                    {formData.description.length}/1000
                  </span>
                </div>
                <textarea className="cfm-textarea" value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  maxLength={1000} rows={4} />
              </div>
              {(post.donationMode === 'food' || post.donationMode === 'both') && (
                <div className="cfm-field">
                  <label className="cfm-label">Food Goal (kg)</label>
                  <input className="cfm-input" type="number" value={formData.foodGoalKg}
                    onChange={e => setFormData({...formData, foodGoalKg: e.target.value})}
                    min="0.1" step="0.1" required />
                </div>
              )}
              <div className="cfm-field">
                <label className="cfm-label">Status</label>
                <select className="cfm-input" value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'funded' | 'closed'})}>
                  <option value="active">Active</option>
                  <option value="funded">Funded</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="cfm-section">
              <span className="cfm-section-label">Post Image</span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
              {formData.imageUrl ? (
                <div className="cfm-image-preview">
                  <img src={formData.imageUrl} alt="Preview" />
                  <button type="button" className="cfm-remove-img" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}>
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/>
                    </svg>
                    Remove
                  </button>
                </div>
              ) : (
                <button type="button" className="cfm-upload-area" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>{uploading ? 'Uploading…' : 'Click to upload image'}</span>
                  <span className="cfm-upload-hint">PNG, JPG up to 10MB</span>
                </button>
              )}
            </div>

            {error && <div className="cfm-error">{error}</div>}
          </div>

          <div className="cfm-footer">
            <button type="button" className="cfm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="cfm-btn-submit green" disabled={loading || uploading || formData.description.length > 1000}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharityDashboard;
