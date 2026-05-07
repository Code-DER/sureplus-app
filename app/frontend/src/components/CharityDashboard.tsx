import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client';
import type { CharityProfile, CharityPost } from '../types/charity';
import type { User } from '../types/user';
import './CharityDashboard.css';

interface CharityDashboardProps {
  user: User;
  onSwitchRole: () => void;
}

export default function CharityDashboard({ user, onSwitchRole }: CharityDashboardProps) {
  const [profile, setProfile] = useState<CharityProfile | null>(null);
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editOrgName, setEditOrgName] = useState('');

  // Post Form State (for both create and edit)
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postAmountNeeded, setPostAmountNeeded] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileData, postsData] = await Promise.all([
          apiGet<CharityProfile>('/charities/myprofile'),
          apiGet<CharityPost[]>(`/charity-posts/by-user/${user.userID}`),
        ]);
        setProfile(profileData);
        setEditOrgName(profileData.organizationName);
        setPosts(postsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.userID]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrgName.trim()) return;
    
    try {
      const updated = await apiPut<CharityProfile>('/charities/myprofile', {
        organizationName: editOrgName
      });
      setProfile(prev => prev ? { ...prev, organizationName: updated.organizationName } : null);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update organization name.');
    }
  };

  const handleOpenCreateForm = () => {
    setEditingPostId(null);
    setPostTitle('');
    setPostDescription('');
    setPostAmountNeeded('');
    setShowPostForm(true);
  };

  const handleOpenEditForm = (post: CharityPost) => {
    setEditingPostId(post.charityID);
    setPostTitle(post.title);
    setPostDescription(post.description || '');
    setPostAmountNeeded(post.amountNeeded.toString());
    setShowPostForm(true);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostLoading(true);
    
    const postData = {
      title: postTitle,
      description: postDescription,
      amountNeeded: parseFloat(postAmountNeeded)
    };

    try {
      if (editingPostId) {
        const updated = await apiPut<CharityPost>(`/charity-posts/${editingPostId}`, postData);
        setPosts(prev => prev.map(p => p.charityID === editingPostId ? updated : p));
      } else {
        const created = await apiPost<CharityPost>('/charity-posts/', postData);
        setPosts(prev => [created, ...prev]);
      }
      setShowPostForm(false);
    } catch (err) {
      console.error('Failed to save post:', err);
      alert('Failed to save fundraising post.');
    } finally {
      setPostLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await apiDelete(`/charity-posts/${postId}`);
      setPosts(prev => prev.filter(p => p.charityID !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete fundraising post.');
    }
  };

  if (loading) {
    return <div className="dashboard-loading"><div className="spinner"></div><p>Loading dashboard...</p></div>;
  }

  if (error || !profile) {
    return <div className="dashboard-error"><p>{error || 'Access denied.'}</p></div>;
  }

  return (
    <div className="charity-dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Charity Dashboard</h1>
          <p>Manage your organization and fundraising efforts.</p>
        </div>
        <button className="btn-switch-role" onClick={onSwitchRole}>
          View as Buyer
        </button>
      </header>

      <div className="dashboard-grid">
        {/* Profile Section */}
        <section className="dashboard-section profile-card">
          <div className="section-title-row">
            <h2>Organization Profile</h2>
            {!isEditingProfile && (
              <button className="btn-edit-small" onClick={() => setIsEditingProfile(true)}>Edit</button>
            )}
          </div>
          
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
              <div className="input-group">
                <label>Organization Name</label>
                <input 
                  type="text" 
                  value={editOrgName} 
                  onChange={(e) => setEditOrgName(e.target.value)} 
                  required
                />
              </div>
              <div className="form-actions-inline">
                <button type="submit" className="btn-save">Save</button>
                <button type="button" className="btn-cancel" onClick={() => setIsEditingProfile(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="org-avatar-med">{profile.organizationName.charAt(0)}</div>
              <div className="org-info-text">
                <h3>{profile.organizationName}</h3>
                <p>{profile.emailAddress}</p>
                <p className="location-tag">{profile.city}, {profile.barangay}</p>
              </div>
            </div>
          )}
        </section>

        {/* Posts Section */}
        <section className="dashboard-section posts-management">
          <div className="section-title-row">
            <h2>Fundraising Posts</h2>
            <button className="btn-create-post" onClick={handleOpenCreateForm}>+ New Post</button>
          </div>

          {showPostForm && (
            <div className="post-form-overlay" onClick={() => setShowPostForm(false)}>
              <div className="post-form-card" onClick={e => e.stopPropagation()}>
                <h3>{editingPostId ? 'Edit Post' : 'Create New Fundraising Post'}</h3>
                <form onSubmit={handleSubmitPost}>
                  <div className="input-group">
                    <label>Post Title</label>
                    <input 
                      type="text" 
                      value={postTitle} 
                      onChange={e => setPostTitle(e.target.value)} 
                      placeholder="e.g. Help us provide 100 meals"
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <textarea 
                      value={postDescription} 
                      onChange={e => setPostDescription(e.target.value)} 
                      placeholder="Tell donors how their money will be used..."
                      rows={4}
                    />
                  </div>
                  <div className="input-group">
                    <label>Goal Amount (PHP)</label>
                    <input 
                      type="number" 
                      value={postAmountNeeded} 
                      onChange={e => setPostAmountNeeded(e.target.value)} 
                      placeholder="0.00"
                      required 
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={postLoading}>
                      {postLoading ? 'Saving...' : 'Save Post'}
                    </button>
                    <button type="button" className="btn-cancel-flat" onClick={() => setShowPostForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="dashboard-posts-list">
            {posts.length === 0 ? (
              <div className="empty-state">
                <p>You haven't created any fundraising posts yet.</p>
              </div>
            ) : (
              posts.map(post => {
                const progress = Math.min(100, (post.currentAmount / post.amountNeeded) * 100);
                return (
                  <div key={post.charityID} className="dashboard-post-card">
                    <div className="post-card-header">
                      <h3>{post.title}</h3>
                      <div className="post-actions">
                        <button className="btn-icon" onClick={() => handleOpenEditForm(post)} aria-label="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="btn-icon delete" onClick={() => handleDeletePost(post.charityID)} aria-label="Delete">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="post-card-desc">{post.description}</p>
                    <div className="post-card-progress">
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="progress-text">
                        <span>₱{post.currentAmount.toLocaleString()} raised</span>
                        <span>Goal: ₱{post.amountNeeded.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
e={{ width: `${progress}%` }} />
                      </div>
                      <div className="progress-text">
                        <span>₱{post.currentAmount.toLocaleString()} raised</span>
                        <span>Goal: ₱{post.amountNeeded.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
