import React, { useState } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onSelect: (role: 'buyer' | 'seller') => void;
}

export default function LandingPage({ onSelect }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | null>('buyer'); // Default to buyer as shown in design

  const handleSignUp = () => {
    if (selectedRole) {
      onSelect(selectedRole);
    }
  };

  return (
    <div className="landing-page">
      {/* Floating Header Pill */}
      <header className="landing-header-pill">
        <div className="header-logo">Sureplus</div>
        <nav className="header-nav">
          <a href="#" className="nav-link active">Home</a>
          <a href="#" className="nav-link">Listings</a>
          <a href="#" className="nav-link">Impact</a>
          <a href="#" className="nav-link">About</a>
        </nav>
        <div className="header-actions">
          <button className="header-icon-btn">
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none"><path d="M8 20c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2C9.5 1.17 8.83.5 8 .5S6.5 1.17 6.5 2v.68C3.64 3.36 2 5.92 2 9v5l-2 2v1h16v-1l-2-2z" fill="#6B7280" /></svg>
          </button>
          <button className="header-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>
          </button>
        </div>
      </header>

      <div className="landing-container">

        {/* Main Content Area */}
        <main className="landing-main">

          {/* Left Column */}
          <div className="landing-left">
            <div className="hero-text-block">
              <h1 className="hero-heading">
                <span className="text-green">Rescue food.</span><br />
                <span className="text-orange">Reduce waste.</span><br />
                <span className="text-green">Help communities.</span>
              </h1>
              <p className="hero-subtext">
                Join the movement to save perfectly good surplus food and redirect it to those who need it most. Choose your role to get started.
              </p>
            </div>

            <div className="role-selection-section">
              <h2 className="role-section-title">Join us and be part of the movement</h2>

              <div className="role-cards-container">
                {/* Seller Card */}
                <div
                  className={`role-card ${selectedRole === 'seller' ? 'selected-seller' : ''}`}
                  onClick={() => setSelectedRole('seller')}
                >
                  <div className={`role-card-icon-bg ${selectedRole === 'seller' ? 'bg-seller-active' : 'bg-seller-inactive'}`}>
                    <svg width="20" height="18" viewBox="0 0 24 24" fill="none" stroke={selectedRole === 'seller' ? '#FFFFFF' : '#0F5238'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                  </div>
                  <div className="role-card-content">
                    <h3>Seller</h3>
                    <p>Retailers and restaurants looking to list surplus inventory and reduce shrinkage.</p>
                  </div>
                </div>

                {/* Buyer Card */}
                <div
                  className={`role-card ${selectedRole === 'buyer' ? 'selected-buyer' : ''}`}
                  onClick={() => setSelectedRole('buyer')}
                >
                  <div className={`role-card-icon-bg ${selectedRole === 'buyer' ? 'bg-buyer-active' : 'bg-buyer-inactive'}`}>
                    <svg width="22" height="19" viewBox="0 0 24 24" fill="none" stroke={selectedRole === 'buyer' ? '#FFFFFF' : '#FE6B00'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                  </div>
                  <div className="role-card-content">
                    <h3>Buyer</h3>
                    <p>Individuals and households seeking high-quality food at discounted rescue prices.</p>
                  </div>
                </div>
              </div>

              <div className="signup-action-area">
                <button
                  className="btn-signup-main"
                  onClick={handleSignUp}
                  disabled={!selectedRole}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Hero Image) */}
          <div className="landing-right">
            <div className="hero-image-wrapper">
              <div className="hero-image">
                {/* Fallback pattern if image is missing */}
                <div className="hero-image-fallback">
                  🥦🍅🥖
                </div>
              </div>
              <div className="hero-image-gradient"></div>

              {/* Floating Impact Card */}
              <div className="floating-impact-card">
                <div className="floating-icon">
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12a5 5 0 110-10 5 5 0 010 10z" fill="#FE6B00" /><path d="M8 4v4l3 3" stroke="#FE6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="floating-text">1,240 lbs of food rescued this week</span>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
