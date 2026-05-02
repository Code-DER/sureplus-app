import React from 'react';
import './EditProfileView.css';

interface EditProfileViewProps {
  onBack: () => void;
  onSave: () => void;
}

export default function EditProfileView({ onBack, onSave }: EditProfileViewProps) {
  return (
    <div className="edit-profile-view">
      <button className="btn-back-profile" onClick={onBack}>
        <span className="icon-placeholder arrow-left-icon"></span>
        Back to profile
      </button>

      <div className="edit-profile-content">
        {/* LEFT COLUMN: Edit Form */}
        <div className="edit-form-card">
          <h1>Edit Profile</h1>
          
          <div className="photo-edit-section">
            <div className="photo-avatar-wrapper">
              <div className="photo-avatar-image"></div>
              <button className="btn-edit-photo" aria-label="Edit Photo">
                <span className="icon-placeholder pencil-icon"></span>
              </button>
            </div>
            <div className="photo-edit-info">
              <h3>Profile Photo</h3>
              <p>Recommended size: 400x400px. JPG or PNG.</p>
            </div>
          </div>

          <hr className="divider" />

          <form className="edit-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" defaultValue="Tina Moran" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" defaultValue="tinamoranniano@sureplus.com" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Phone Number</label>
                <input type="tel" defaultValue="+63 933 123 4567" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Delivery Address</label>
                <div className="input-with-icon">
                  <input type="text" defaultValue="Kalye Otso, Purok 4, Sitio Basak, Mintal, Davao City, Philippines" />
                  <span className="icon-placeholder input-pin-icon"></span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save-changes">Save Changes</button>
              <button type="button" className="btn-cancel-changes" onClick={onBack}>Cancel</button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Side Cards */}
        <div className="edit-side-col">
          {/* Account Security */}
          <div className="security-card">
            <div className="security-icon-wrapper">
              <span className="icon-placeholder shield-icon-white"></span>
            </div>
            <h2>Account Security</h2>
            <p>Your data is uhm huhu pls secure with kay idk pls lang, wag bobo.</p>
            <button className="btn-manage-password">Manage Password</button>
          </div>

          {/* Rescue Impact */}
          <div className="impact-progress-card">
            <div className="impact-header">
              <span className="icon-placeholder leaf-icon-orange"></span>
              <h3>Rescue Impact</h3>
            </div>
            
            <div className="impact-stats-row">
              <span className="impact-label-sm">Food Rescued</span>
              <span className="impact-value-sm">124 kg</span>
            </div>
            
            <div className="impact-progress-bg">
              <div className="impact-progress-fill" style={{ width: '82%' }}></div>
            </div>
            
            <p className="impact-goal-text">Next goal: 150 kg for "Eco Warrior char" badge</p>
          </div>
        </div>
      </div>
    </div>
  );
}
