import { useState } from 'react';
import './EditProfileView.css';
import { userAPI, charityAPI } from '../api/apis';
import UserAvatar from './UserAvatar';

import BackIcon from '../assets/Global Profile System/Back Icon.svg';
import PrivSecuIcon from '../assets/Global Profile System/Priv & Secu Icon.svg';
import EcoIcon from '../assets/Global Profile System/Eco Icon.svg';

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

interface SellerProfile {
  userID: string;
  sellerType: string;
  isVerified: boolean;
  companyName: string;
}

interface CharityProfile {
  userID: string;
  organizationName: string;
}

interface EditProfileViewProps {
  profile: UserProfile
  sellerProfile: SellerProfile | null;
  charityProfile: CharityProfile | null;
  role: string;
  onBack: () => void;
  onSave: () => Promise<void>;
}

export default function EditProfileView({ profile, sellerProfile, charityProfile, role, onBack, onSave }: EditProfileViewProps) {
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phoneNumber: profile.phoneNumber || '',
    street: profile.street || '',
    residentialName: profile.residentialName || '',
    barangay: profile.barangay || '',
    city: profile.city || '',
  });
  const [companyName, setCompanyName] = useState(sellerProfile?.companyName || '');
  const [sellerType, setSellerType] = useState(sellerProfile?.sellerType || '');
  const [organizationName, setOrganizationName] = useState(charityProfile?.organizationName || '');
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      if (isPasswordExpanded) {
        const hasPasswordInput = currentPassword || newPassword || confirmNewPassword;

        if (hasPasswordInput) {
          if (!currentPassword || !newPassword || !confirmNewPassword) {
            throw new Error('Please fill in all password fields to change your password.');
          }

          if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long.');
          }
          if (newPassword !== confirmNewPassword) {
            throw new Error('New password and confirmation do not match.');
          }

          await userAPI.changeMyPassword({
            currentPassword,
            newPassword,
          });
        }
      }

      const userUpdatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        street: formData.street,
        residentialName: formData.residentialName,
        barangay: formData.barangay,
        city: formData.city,
      };

      await userAPI.updateMyProfile(userUpdatePayload);

      if (role === 'seller') {
        const sellerUpdatePayload: Record<string, string> = {};
        if (companyName !== sellerProfile?.companyName) sellerUpdatePayload.companyName = companyName;
        if (sellerType !== sellerProfile?.sellerType) sellerUpdatePayload.sellerType = sellerType;

        if (Object.keys(sellerUpdatePayload).length > 0) {
          await userAPI.updateMySellerProfile(sellerUpdatePayload);
        }
      }

      if (role === 'charity') {
        if (organizationName !== charityProfile?.organizationName) {
          await charityAPI.updateMyCharityProfile({ organizationName });
        }
      }

      await onSave();
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } }, message?: string };
      console.error('Error saving profile:', error);
      setErrorMessage(error?.response?.data?.detail || error?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-view">
      <button className="btn-back-profile" onClick={onBack}>
        <img src={BackIcon} alt="Back" width="16" height="16" />
        Back to profile
      </button>

      <div className="edit-profile-content">
        <div className="edit-form-card">
          <h1>Edit Profile</h1>

          <div className="photo-edit-section">
            <UserAvatar firstName={profile.firstName} lastName={profile.lastName} size={80} />
            <div className="photo-edit-info">
              <h3>Profile Photo</h3>
              <p>Your avatar is automatically generated from your name.</p>
            </div>
          </div>

          <hr className="divider" />

          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row two-cols">
              <div className="form-group">
                <label>Email Address (cannot be edited)</label>
                <input type="email" value={profile.emailAddress} disabled />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>DELIVERY ADDRESS</label>
            </div>
            
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Street</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Residential / Village / Subdivision</label>
                <input
                  type="text"
                  name="residentialName"
                  value={formData.residentialName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row two-cols">
              <div className="form-group">
                <label>Barangay</label>
                <input
                  type="text"
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group half-width">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {role === 'seller' && (
              <>
                <hr className="divider" />
                <h2>Seller Profile</h2>
                <div className="form-row two-cols">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Seller Type</label>
                    <input
                      type="text"
                      name="sellerType"
                      value={sellerType}
                      onChange={(event) => setSellerType(event.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'charity' && (
              <>
                <hr className="divider" />
                <h2>Charity Profile</h2>
                <div className="form-group">
                  <label>Organization Name</label>
                  <input
                    type="text"
                    name="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>
              </>
            )}

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-save-changes" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn-cancel-changes" onClick={onBack} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="edit-side-col">
          <div className="security-card">
            <div className="security-icon-wrapper">
              <img src={PrivSecuIcon} alt="Security" width="24" height="24" />
            </div>
            <h2>Account Security</h2>
            <p>Manage your account preferences and password in one place.</p>
            <button
              className="btn-manage-password"
              type="button"
              onClick={() => setIsPasswordExpanded((current) => !current)}
            >
              {isPasswordExpanded ? 'Hide Password Fields' : 'Manage Password'}
            </button>
            <div>
              {isPasswordExpanded && (
              <div>
                <hr className="divider" />
                <h2>Change Password</h2>
                <p>Fill up the fields to change your password.</p>
                <div className="form-row">
                  <div className="form-group">
                    <label style={{ color: "white"}}>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label style={{ color: "white"}}>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </div>
                </div>
                <div className='form-row'>
                  <div className="form-group">
                    <label style={{ color: "white"}}>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(event) => setConfirmNewPassword(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* DECIDE ON WHAT ENDPOINT TO PLACE HERE */}
          {/* <div className="impact-progress-card">
            <div className="impact-header">
              <img src={EcoIcon} alt="Eco" width="24" height="24" />
              <h3>Rescue Impact</h3>
            </div>
            <div className="impact-stats-row">
              <span className="impact-label-sm">Food Rescued</span>
              <span className="impact-value-sm">124 kg</span>
            </div>
            <div className="impact-progress-bg">
              <div className="impact-progress-fill" style={{ width: '82%' }}></div>
            </div>
            <p className="impact-goal-text">Next goal: 150 kg for the Eco Warrior badge.</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
