import { useEffect, useState, useCallback } from 'react';
import './ProfileView.css';
import EditProfileView from './EditProfileView';
import { userAPI } from '../api/apis';

const SELLER_TYPES = ['Individual', 'Business', 'Distributor', 'Restaurant', 'Bakery'];


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

interface ProfileViewProps {
  onSwitchRole: (role: 'buyer' | 'seller' | 'admin') => void;
}

export default function ProfileView({ onSwitchRole }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [impactSummary, setImpactSummary] = useState<SocialImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [sellerForm, setSellerForm] = useState({ sellerType: '', companyName: '' });
  const [sellerSubmitting, setSellerSubmitting] = useState(false);
  const [sellerError, setSellerError] = useState('');
  const [sellerSuccess, setSellerSuccess] = useState(false);

  const fetchProfileData = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found, redirecting to login...');
      return;
    }

    try {
      setLoading(true);
      const profileResponse = await userAPI.getMyProfile();
      const userData = profileResponse.data;
      setProfile(userData);

      const fetchPromises = [];

      if (userData.role === 'buyer') {
        fetchPromises.push(
          userAPI.getMyBuyerProfile()
            .then(response => setBuyerProfile(response.data))
            .catch(error => {
              console.log('Buyer profile not found:', error);
              setBuyerProfile(null);
            })
        );
      } else if (userData.role === 'seller') {
        fetchPromises.push(
          userAPI.getMySellerProfile()
            .then(response => setSellerProfile(response.data))
            .catch(error => {
              console.log('Seller profile not found:', error);
              setSellerProfile(null);
            })
        );
      } else {
        setBuyerProfile(null);
        setSellerProfile(null);
      }

      fetchPromises.push(
        userAPI.getMyImpactSummary()
          .then(response => setImpactSummary(response.data))
          .catch(error => {
            console.log('Impact summary not found:', error);
            setImpactSummary(null);
          })
      );

      await Promise.all(fetchPromises);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleProfileSaved = async () => {
    await fetchProfileData();
    setIsEditing(false);
  };

  const handleUpgradeToSeller = async () => {
    setSellerError('');
    if (!sellerForm.sellerType) { setSellerError('Please select a seller type.'); return; }
    if (!sellerForm.companyName.trim()) { setSellerError('Please enter a company / trade name.'); return; }

    setSellerSubmitting(true);
    try {
      await userAPI.upgradeToSeller({
        sellerType: sellerForm.sellerType.toLowerCase(),
        companyName: sellerForm.companyName,
      });
      setSellerSuccess(true);
    } catch (err: any) {
      setSellerError(err.response?.data?.detail || 'Failed to upgrade. Please try again.');
    } finally {
      setSellerSubmitting(false);
    }
  };

  if (loading) return <p>Loading profile...</p>
  if (!profile) return <p>Please log in.</p>
  
  if (isEditing) {
    return (
      <EditProfileView
        profile={profile}
        sellerProfile={sellerProfile}
        role={profile.role}
        onBack={() => setIsEditing(false)}
        onSave={handleProfileSaved}
      />
    );
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
          
          <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Edit Profile</button>
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

        {/* Become a Seller Row */}
        {profile.role === 'buyer' && (
          <div className="profile-settings-row">
            <div className="settings-box" style={{ cursor: 'pointer' }} onClick={() => { setShowSellerModal(true); setSellerError(''); setSellerSuccess(false); }}>
              <div className="settings-icon-bg" style={{ background: '#FFF3EA' }}>
                <span className="icon-placeholder bell-icon-green" style={{ background: '#FE6B00' }}></span>
              </div>
              <div className="settings-info">
                <h4>Become a Seller</h4>
                <p>Start listing surplus food</p>
              </div>
              <span style={{ marginLeft: 'auto', color: '#707973', fontSize: '18px' }}>›</span>
            </div>
          </div>
        )}

        {/* Seller Upgrade Modal */}
        {showSellerModal && (
          <div className="seller-modal-overlay" onClick={() => !sellerSuccess && setShowSellerModal(false)}>
            <div className="seller-modal" onClick={(e) => e.stopPropagation()}>
              {sellerSuccess ? (
                <>
                  <div className="seller-modal-success">
                    <div className="seller-modal-success-icon">✓</div>
                    <h3>You're now a Seller!</h3>
                    <p>Please log in again for your new role to take effect.</p>
                  </div>
                  <button
                    className="btn-seller-submit"
                    style={{ marginTop: '24px', width: '100%' }}
                    onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                  >
                    Log In Again
                  </button>
                </>
              ) : (
                <>
                  <div className="seller-modal-header">
                    <h3>Become a Seller</h3>
                    <button className="seller-modal-close" onClick={() => setShowSellerModal(false)}>×</button>
                  </div>
                  <p className="seller-modal-desc">Fill in your seller details to start listing food items on SurePlus.</p>

                  {sellerError && <div className="seller-modal-error">{sellerError}</div>}

                  <div className="seller-modal-field">
                    <label>Seller Type</label>
                    <div className="seller-select-wrapper">
                      <select
                        value={sellerForm.sellerType}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, sellerType: e.target.value }))}
                      >
                        <option value="">Select type...</option>
                        {SELLER_TYPES.map(t => (
                          <option key={t} value={t.toLowerCase()}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="seller-modal-field">
                    <label>Company / Trade Name</label>
                    <div className="seller-input-wrapper">
                      <input
                        type="text"
                        placeholder="e.g. Harvest Bakery"
                        value={sellerForm.companyName}
                        onChange={(e) => setSellerForm(prev => ({ ...prev, companyName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="seller-modal-footer">
                    <button className="btn-seller-cancel" onClick={() => setShowSellerModal(false)}>Cancel</button>
                    <button className="btn-seller-submit" onClick={handleUpgradeToSeller} disabled={sellerSubmitting}>
                      {sellerSubmitting ? 'Submitting...' : 'Become a Seller'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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

