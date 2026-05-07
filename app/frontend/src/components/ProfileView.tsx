import { useState, useEffect } from 'react';
import './ProfileView.css';
import EditProfileView from './EditProfileView';
import { apiGet } from '../api/client';
import type { SocialImpactSummary } from '../types/charity';
import type { User } from '../types/user';

interface ProfileViewProps {
  user: User | null;
}

export default function ProfileView({ user }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState<SocialImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await apiGet<SocialImpactSummary>('/social-impact/summary');
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch social impact summary:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (isEditing) {
    return <EditProfileView onBack={() => setIsEditing(false)} onSave={() => setIsEditing(false)} />;
  }

  const impactValue = loading ? '...' : `${summary?.totalRescuedKilos ?? 0} kg`;
  const carbonValue = loading ? '...' : `${summary?.totalCarbonOffset ?? 0}kg`;
  const rescuedItems = loading ? '...' : (summary?.purchaseCount ?? 0);

  return (
    <div className="profile-view">
      {/* ====== LEFT COLUMN ====== */}
      <div className="profile-left-col">
        
        {/* User Hero Card */}
        <div className="profile-user-card">
          <div className="profile-avatar-wrapper">
            <div className="avatar-image"></div>
            <div className="avatar-check-badge">
              <span className="icon-placeholder check-icon"></span>
            </div>
          </div>
          
          <h2 className="user-name-large">{user?.fullName ?? 'Tina Moran'}</h2>
          
          <div className="user-badges-row">
            <span className="role-pill">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Buyer'}</span>
            <span className="rating-pill">
              <span className="star-icon">★</span> 4.8
            </span>
          </div>
          
          <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>

        {/* Rescuer Impact Card */}
        <div className="rescuer-impact-card">
          <div className="impact-info">
            <span className="impact-label">Total Food Rescued</span>
            <span className="impact-value">{impactValue}</span>
          </div>
          <div className="impact-icon-wrapper">
            <span className="icon-placeholder leaf-icon"></span>
          </div>
        </div>

      </div>

      {/* ====== RIGHT COLUMN ====== */}
      <div className="profile-right-col">
        
        {/* Account Details */}
        <div className="account-details-card">
          <div className="account-header">
            <h3>Account Details</h3>
            <span className="icon-placeholder settings-icon"></span>
          </div>
          
          <div className="account-grid">
            <div className="account-field">
              <label>FULL NAME</label>
              <p>{user?.fullName ?? 'Tina Moran'}</p>
            </div>
            <div className="account-field">
              <label>EMAIL ADDRESS</label>
              <p>{user?.email ?? 'dana.jill@sureplus.app'}</p>
            </div>
            <div className="account-field">
              <label>PHONE NUMBER</label>
              <p>{user?.phoneNumber ?? '+63 933 123 4567'}</p>
            </div>
            <div className="account-field">
              <label>PRIMARY ROLE</label>
              <p>{user?.role === 'buyer' ? 'Community Buyer' : user?.role === 'seller' ? 'Partner Seller' : user?.role === 'charity' ? 'Charity Organization' : 'Administrator'}</p>
            </div>
          </div>
          
          <div className="account-full-row">
            <label>DELIVERY ADDRESS</label>
            <div className="address-value">
              <span className="icon-placeholder pin-icon"></span>
              <p>{user?.deliveryAddress ?? 'Kalye Otso, Purok 4, Sitio Basak, Mintal, Davao City, Philippines'}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="profile-stats-row">
          <div className="stat-box">
            <span className="stat-label">Points</span>
            <span className="stat-value orange">1,250</span>
            {/* TODO: wire points from API */}
          </div>
          <div className="stat-box">
            <span className="stat-label">Items Rescued</span>
            <span className="stat-value green">{rescuedItems}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">CO₂ Saved</span>
            <span className="stat-value teal">{carbonValue}</span>
          </div>
        </div>

        {/* Settings Row */}
        <div className="profile-settings-row">
          <div className="settings-box">
            <div className="settings-icon-bg">
              <span className="icon-placeholder bell-icon-green"></span>
            </div>
            <div className="settings-info">
              <h4>Notifications</h4>
              <p>Manage alerts and news</p>
            </div>
          </div>
          
          <div className="settings-box">
            <div className="settings-icon-bg">
              <span className="icon-placeholder shield-icon-green"></span>
            </div>
            <div className="settings-info">
              <h4>Privacy & Security</h4>
              <p>Password and data</p>
            </div>
          </div>

          {user?.role === 'charity' && (
            <div className="settings-box" style={{ cursor: 'pointer' }}>
              <div className="settings-icon-bg">
                <span className="icon-placeholder shield-icon-green" style={{ background: '#FE6B00' }}></span>
              </div>
              <div className="settings-info">
                <h4>Charity Dashboard</h4>
                <p>Manage your posts</p>
              </div>
            </div>
          )}
        </div>

        {/* Logout Row */}
        <div className="profile-logout-row">
          <button className="btn-logout" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); }}>
            <span className="icon-placeholder logout-icon"></span>
            Logout Account
          </button>
        </div>

      </div>
    </div>
  );
}
