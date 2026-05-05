import { useEffect, useState } from 'react';
import './ProfileView.css';
import EditProfileView from './EditProfileView';

interface UserProfile {
  userID: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  role: string;
  phoneNumber: string;
  street: string;
  residentialName: string;
  barangay: string;
  city: string;
}

export default function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found, redirecting to login...');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/users/myprofile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setProfile(result);
        } else {
          const errorPayload = await response.json().catch(() => null);
          console.error('Failed to fetch profile.', errorPayload?.detail || response.statusText);
        }
      } catch (error) {
        console.error('Error connecting to backend:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>
  if (!profile) return <p>Please log in.</p>
  
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
          
          <h2 className="user-name-large">{profile.firstName}</h2>
          
          <div className="user-badges-row">
            <span className="role-pill" style={{ textTransform: 'capitalize' }}>{profile.role}</span>
            <span className="rating-pill">
              <span className="star-icon">★</span> 4.8
            </span>
          </div>
          
          {/* NO ENDPOINT YET */}
          {/* <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Edit Profile</button> */}
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
              <p>{profile.firstName} {profile.lastName}</p>
            </div>
            <div className="account-field">
              <label>EMAIL ADDRESS</label>
              <p>{profile.emailAddress}</p>
            </div>
            <div className="account-field">
              <label>PHONE NUMBER</label>
              <p>{profile.phoneNumber}</p>
            </div>
            <div className="account-field">
              <label>PRIMARY ROLE</label>
              <p style={{ textTransform: 'capitalize' }}>{profile.role}</p>
            </div>
          </div>
          
          <div className="account-full-row">
            <label>DELIVERY ADDRESS</label>
            <div className="address-value">
              <span className="icon-placeholder pin-icon"></span>
              <p>{profile.street}, {profile.residentialName}, {profile.barangay}, {profile.city}</p>
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

        {/* NO ENDPOINT YET */}
        {/* Settings Row */}
        {/* <div className="profile-settings-row">
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
        </div> */}

        {/* Logout Row */}
        <div className="profile-logout-row">
          <button className="btn-logout" 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            <span className="icon-placeholder logout-icon"></span>
            Logout Account
          </button>
        </div>

      </div>
    </div>
  );
}
