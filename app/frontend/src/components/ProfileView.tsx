import { useEffect, useState } from 'react';
import './ProfileView.css';
import EditProfileView from './EditProfileView';
import { userAPI } from '../api/apis';


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

interface BuyerProfile {
  userID: string;
  points: number;
}

interface SellerProfile {
  userID: string;
  sellerType: string;
  isVerified: boolean;
  companyName: string;
}

interface SocialImpactSummary {
  totalCarbonOffset: number;
  totalRescuedKilos: number;
  totalPeopleFed: number;
  purchaseCount: number;
}

export default function ProfileView() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [impactSummary, setImpactSummary] = useState<SocialImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found, redirecting to login...');
        return;
      }

      try {
        // Fetch basic user profile
        const profileResponse = await userAPI.getMyProfile();
        const userData = profileResponse.data;
        setProfile(userData);

        // Fetch role-specific data based on user role
        const fetchPromises = [];

        if (userData.role === 'buyer') {
          fetchPromises.push(
            userAPI.getMyBuyerProfile()
              .then(response => setBuyerProfile(response.data))
              .catch(error => console.log('Buyer profile not found:', error))
          );
        } else if (userData.role === 'seller') {
          fetchPromises.push(
            userAPI.getMySellerProfile()
              .then(response => setSellerProfile(response.data))
              .catch(error => console.log('Seller profile not found:', error))
          );
        }

        // Always fetch impact summary
        fetchPromises.push(
          userAPI.getMyImpactSummary()
            .then(response => setImpactSummary(response.data))
            .catch(error => console.log('Impact summary not found:', error))
        );

        // Wait for all role-specific fetches to complete
        await Promise.all(fetchPromises);

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
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
            <span className="impact-value">{impactSummary ? `${impactSummary.totalRescuedKilos} kg` : '0 kg'}</span>
          </div>
          <div className="impact-icon-wrapper">
            <span className="icon-placeholder leaf-icon"></span>
          </div>
        </div>

        {/* Role-specific information */}
        {profile.role === 'buyer' && buyerProfile && (
          <div className="buyer-info-card">
            <div className="impact-info">
              <span className="impact-label">Points</span>
              <span className="impact-value">{buyerProfile.points}</span>
            </div>
            <div className="impact-icon-wrapper">
              <span className="icon-placeholder points-icon">💰</span>
            </div>
          </div>
        )}

        {profile.role === 'seller' && sellerProfile && (
          <div className="seller-info-card">
            <div className="seller-header">
              <h4>{sellerProfile.companyName}</h4>
              <div className="seller-badges">
                <span className="seller-type-badge">{sellerProfile.sellerType}</span>
                {sellerProfile.isVerified && (
                  <span className="verified-badge">
                    <span className="icon-placeholder check-icon">✓</span>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

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
            <span className="stat-label">Carbon Offset</span>
            <span className="stat-value orange">
              {impactSummary ? `${impactSummary.totalCarbonOffset} ` : '0'}
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">People Fed</span>
            <span className="stat-value green">
              {impactSummary ? `${impactSummary.totalPeopleFed} kg` : '0'}
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Purchase Count</span>
            <span className="stat-value teal">
              {impactSummary ? `${impactSummary.purchaseCount} purchases` : '0 purchases'}
            </span>
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
