import React, { useEffect, useState } from 'react';
import type { CharityPost } from '../api/types';
import { charityPostAPI } from '../api/apis';
import './AdminCharityPosts.css';

const AdminCharityPosts: React.FC = () => {
  const [posts, setPosts] = useState<CharityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      await charityPostAPI.updatePost(postId, { status: newStatus });
      setPosts(prev => prev.map(p => p.charityID === postId ? { ...p, status: newStatus } : p));
    } catch {
      alert('Failed to update post status.');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this post? This cannot be undone.')) return;
    try {
      await charityPostAPI.deletePost(postId);
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
    </div>
  );
};

export default AdminCharityPosts;
