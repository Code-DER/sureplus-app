import React, { useEffect, useState, useRef } from 'react';
import type { CharityPost } from '../api/types';
import { charityPostAPI, adminAPI, uploadsAPI } from '../api/apis';
import './AdminCharityPosts.css';

const AdminCharityPosts: React.FC = () => {
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<CharityPost | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await charityPostAPI.getAllPosts({ limit: 100 });
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load charity posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleStatusChange = async (postId: string, newStatus: 'active' | 'closed') => {
    if (!window.confirm(`Are you sure you want to set this post to ${newStatus}?`)) return;
    try {
      await adminAPI.updateCharityPost(postId, { status: newStatus });
      setPosts(prev => prev.map(p => p.charityID === postId ? { ...p, status: newStatus } : p));
    } catch {
      alert('Failed to update post status.');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this post? This cannot be undone.')) return;
    try {
      await adminAPI.deleteCharityPost(postId);
      setPosts(prev => prev.filter(p => p.charityID !== postId));
    } catch {
      alert('Failed to delete post.');
    }
  };

  if (loading) return <div className="admin-loading">Loading posts...</div>;

  return (
    <div className="admin-charity-posts">
      <div className="admin-page-header">
        <h2>Charity Post Moderation</h2>
        <p>Review and manage all donation campaigns on the platform.</p>
      </div>

      {error && <div className="admin-error-msg">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Campaign Title</th>
              <th>Status</th>
              <th>Mode</th>
              <th>Progress</th>
              <th>Date Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-row">No charity posts found.</td>
              </tr>
            ) : (
              posts.map(post => (
                <tr key={post.charityID}>
                  <td>
                    <div className="post-title-cell">
                      <span className="post-name">{post.title}</span>
                      <span className="post-id">ID: {post.charityID.substring(0, 8)}...</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${post.status}`}>{post.status}</span>
                  </td>
                  <td>
                    <span className="mode-text">{post.donationMode.toUpperCase()}</span>
                  </td>
                  <td>
                    <div className="admin-progress-cell">
                      {post.donationMode !== 'food' && (
                        <div className="progress-mini">
                          ₱{post.currentAmount.toLocaleString()} / ₱{post.amountNeeded?.toLocaleString() || '∞'}
                        </div>
                      )}
                      {post.donationMode !== 'money' && (
                        <div className="progress-mini">
                          {post.currentFoodKg.toFixed(1)}kg / {post.foodGoalKg?.toFixed(1) || '∞'}kg
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions-cell">
                      <button className="btn-table btn-edit" onClick={() => setEditingPost(post)}>
                        Edit
                      </button>
                      {post.status !== 'closed' && (
                        <button className="btn-table btn-close" onClick={() => handleStatusChange(post.charityID, 'closed')}>
                          Close
                        </button>
                      )}
                      {post.status === 'closed' && (
                        <button className="btn-table btn-reopen" onClick={() => handleStatusChange(post.charityID, 'active')}>
                          Reopen
                        </button>
                      )}
                      <button className="btn-table btn-delete" onClick={() => handleDelete(post.charityID)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingPost && (
        <AdminEditPostModal 
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            setEditingPost(null);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
};

interface EditModalProps {
  post: CharityPost;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminEditPostModal: React.FC<EditModalProps> = ({ post, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ 
    title: post.title, 
    description: post.description || '', 
    imageUrl: post.imageUrl || '',
    amountNeeded: post.amountNeeded?.toString() || '',
    foodGoalKg: post.foodGoalKg?.toString() || '',
    status: post.status as "active" | "funded" | "closed"
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
      await adminAPI.updateCharityPost(post.charityID, {
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
          <h2>Admin: Edit Post</h2>
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
                rows={4}
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
                onChange={e => setFormData({...formData, status: e.target.value as any})}
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

export default AdminCharityPosts;
