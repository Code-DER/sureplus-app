import React from 'react';
import './RoleSelector.css';

interface RoleSelectorProps {
  onSelect: (role: 'buyer' | 'seller') => void;
}

export default function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="role-selector-page">
      <div className="role-selector-card">
        <div className="role-brand">
          <div className="role-logo-icon">
            <span className="logo-letter">S</span>
          </div>
          <h1>Sureplus</h1>
          <p className="role-tagline">Food Rescue Marketplace</p>
        </div>

        <h2 className="role-prompt">How would you like to continue?</h2>

        <div className="role-options">
          <button className="role-option buyer-option" onClick={() => onSelect('buyer')}>
            <div className="role-icon-wrapper buyer-icon-bg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h3>Buyer</h3>
            <p>Browse discounted surplus food, rescue meals, and reduce waste in your community.</p>
            <span className="role-cta">Enter Marketplace →</span>
          </button>

          <button className="role-option seller-option" onClick={() => onSelect('seller')}>
            <div className="role-icon-wrapper seller-icon-bg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3>Seller</h3>
            <p>List your surplus inventory, track sales, and make an impact on food waste.</p>
            <span className="role-cta">Open Dashboard →</span>
          </button>
        </div>

        <p className="role-footer">You can switch roles anytime from your profile settings.</p>
      </div>
    </div>
  );
}
