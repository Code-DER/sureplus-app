import { useState, useEffect } from 'react';
import type { CharityProfile, CharityPost } from '../api/types';
import { charityAPI, charityPostAPI } from '../api/apis';
import CharityPostCard from './CharityPostCard';
import './CharityDashboard.css';

interface CharityDashboardProps {
  onSwitchRole: () => void;
}

const CharityDashboard: React.FC<CharityDashboardProps> = ({ onSwitchRole }) => {
  const [profile, setProfile] = useState<CharityProfile | null>(null);
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<CharityPost | null>(null);

  const fetchData = async () => {
    try {
      const [profileRes] = await Promise.all([
        charityAPI.getMyCharityProfile(),
        // We'll use getMyProfile to get the userID first
      ]);

      const charityProfile = profileRes.data;
      setProfile(charityProfile);

      // Fetch posts specific to this charity user
      const userPostsRes = await charityPostAPI.getPostsByUser(charityProfile.userID);
      setPosts(userPostsRes.data);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching charity data:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
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

  if (loading) return <div className="charity-dashboard-loading"><div className="spinner"></div></div>;
  if (error) return <div className="charity-dashboard-error"><p>{error}</p><button onClick={() => { setLoading(true); fetchData(); }}>Retry</button></div>;

  return (
    <div className="charity-dashboard-page">
      <header className="charity-dashboard-header">
        <div className="header-left">
          <h1>{profile?.organizationName || 'Charity Dashboard'}</h1>
          <p>Manage your donation posts and track community support.</p>
        </div>
        <div className="header-right">
          <button className="switch-role-btn" onClick={onSwitchRole}>Switch to Buyer</button>
          <div className="profile-avatar">{profile?.firstName[0]}{profile?.lastName[0]}</div>
        </div>
      </header>

      <main className="charity-dashboard-main">
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
                />
              ))}
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
    donationMode: 'money' | 'food' | 'both';
    amountNeeded: string;
    foodGoalKg: string;
  }>({ 
    title: '', 
    description: '', 
    donationMode: 'money',
    amountNeeded: '',
    foodGoalKg: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              <label>Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Describe what this donation will be used for..."
              />
            </div>

            <div className="form-group">
              <label>Donation Mode</label>
              <select 
                value={formData.donationMode} 
                onChange={e => setFormData({...formData, donationMode: e.target.value as 'money' | 'food' | 'both'})}
              >
                <option value="money">Money only</option>
                <option value="food">Food only</option>
                <option value="both">Money + Food</option>
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
            <button type="submit" className="confirm-btn" disabled={loading}>
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
    amountNeeded: post.amountNeeded?.toString() || '',
    foodGoalKg: post.foodGoalKg?.toString() || '',
    status: post.status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await charityPostAPI.updatePost(post.charityID, {
        title: formData.title,
        description: formData.description,
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
              <label>Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
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
            <button type="submit" className="confirm-btn" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharityDashboard;
