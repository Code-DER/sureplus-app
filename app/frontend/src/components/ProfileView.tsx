import React, { useState } from 'react';
import './ProfileView.css';
import EditProfileView from './EditProfileView';

export default function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <EditProfileView onBack={() => setIsEditing(false)} onSave={() => setIsEditing(false)} />;
  }

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
          
          <h2 className="user-name-large">Tina Moran</h2>
          
          <div className="user-badges-row">
            <span className="role-pill">Buyer</span>
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
            <span className="impact-value">124 kg</span>
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
              <p>Tina Moran</p>
            </div>
            <div className="account-field">
              <label>EMAIL ADDRESS</label>
              <p>dana.jill@sureplus.app</p>
            </div>
            <div className="account-field">
              <label>PHONE NUMBER</label>
              <p>+63 933 123 4567</p>
            </div>
            <div className="account-field">
              <label>PRIMARY ROLE</label>
              <p>Community Buyer</p>
            </div>
          </div>
          
          <div className="account-full-row">
            <label>DELIVERY ADDRESS</label>
            <div className="address-value">
              <span className="icon-placeholder pin-icon"></span>
              <p>Kalye Otso, Purok 4, Sitio Basak, Mintal, Davao City, Philippines</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="profile-stats-row">
          <div className="stat-box">
            <span className="stat-label">Points</span>
            <span className="stat-value orange">1,250</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Items Rescued</span>
            <span className="stat-value green">42</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">CO₂ Saved</span>
            <span className="stat-value teal">12.5kg</span>
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
        </div>

        {/* Logout Row */}
        <div className="profile-logout-row">
          <button className="btn-logout">
            <span className="icon-placeholder logout-icon"></span>
            Logout Account
          </button>
        </div>

      </div>
    </div>
  );
}
