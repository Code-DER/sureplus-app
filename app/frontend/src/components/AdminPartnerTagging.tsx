import React, { useState } from 'react';
import './AdminPartnerTagging.css';

const PARTNERS = [
  {
    id: 1,
    image: 'https://placehold.co/192x266/C8A97A/FFFFFF?text=Bakery',
    badgeText: 'SELLER',
    badgeType: 'seller',
    name: 'Harvest Crust Artisan Bakery',
    location: 'Sitio Basak, Mintal, Davao',
    status: 'Verified',
    statusType: 'verified',
    tags: ['Organic', 'Bakery', 'Zero Waste Certified'],
    avatars: [
      { initials: 'JD', bg: '#E2E8F0', color: '#191C1A' },
      { initials: 'MR', bg: '#D1FAE5', color: '#0F5238' },
      { initials: 'VC', bg: '#F1F5F9', color: '#1E293B' },
    ],
    footerNote: 'Verification documents received 2 days ago',
    footerAction: null,
  },
  {
    id: 2,
    image: 'https://placehold.co/192x224/7BBF7A/FFFFFF?text=Kitchen',
    badgeText: 'PENDING',
    badgeType: 'pending',
    name: 'Unity Soup Kitchen & Pantry',
    location: 'Purok Malipayon, Brgy. Sto Niño',
    status: 'Community',
    statusType: 'community',
    tags: ['Community Kitchen'],
    avatars: [],
    footerNote: 'Verification documents received 2 days ago',
    footerAction: 'REVIEW DOCUMENTS',
  },
];

const CATEGORY_TAGS = [
  { id: 1, label: 'Organic' },
  { id: 2, label: 'Bakery' },
  { id: 3, label: 'Zero Waste' },
  { id: 4, label: 'Dairy Free' },
  { id: 5, label: 'Growers' },
  { id: 6, label: 'Supplies' },
];

export default function AdminPartnerTagging() {
  const [pendingVerification, setPendingVerification] = useState(true);
  const [untaggedUsers, setUntaggedUsers]             = useState(false);
  const [activeTagIds, setActiveTagIds]               = useState<number[]>([1]);

  const toggleCatTag = (id: number) =>
    setActiveTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  return (
    <div className="pt-layout">

      {/* ── Partner List ── */}
      <div className="pt-list">
        {PARTNERS.map(partner => (
          <div className="pt-card" key={partner.id}>

            {/* Image col */}
            <div className="pt-img-col">
              <img src={partner.image} alt={partner.name} className="pt-img" />
              <span className={`pt-badge pt-badge--${partner.badgeType}`}>{partner.badgeText}</span>
            </div>

            {/* Content col */}
            <div className="pt-content">

              {/* Header row */}
              <div className="pt-header-row">
                <div className="pt-name-block">
                  <h3 className="pt-name">{partner.name}</h3>
                  <div className="pt-location">
                    <svg width="9" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{partner.location}</span>
                  </div>
                </div>
                <div className="pt-status-block">
                  <span className={`pt-status-chip pt-status-chip--${partner.statusType}`}>
                    {partner.statusType === 'verified' ? (
                      <svg width="9" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    ) : (
                      <svg width="12" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      </svg>
                    )}
                    {partner.status}
                  </span>
                  <button className="pt-dots-btn">
                    <svg width="4" height="16" viewBox="0 0 4 20" fill="#94A3B8">
                      <circle cx="2" cy="3"  r="2"/>
                      <circle cx="2" cy="10" r="2"/>
                      <circle cx="2" cy="17" r="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Applied Tags */}
              <div className="pt-tags-block">
                <span className="pt-tags-label">APPLIED TAGS</span>
                <div className="pt-tags-row">
                  {partner.tags.map((tag, i) => (
                    <span className="pt-applied-tag" key={i}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0F5238" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      </svg>
                      {tag}
                      <button className="pt-tag-remove">
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#0F5238" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6"  y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </span>
                  ))}
                  <button className="pt-add-tag-btn">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="3">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5"  y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-footer">
                {partner.avatars.length > 0 ? (
                  <div className="pt-avatars">
                    {partner.avatars.map((av, i) => (
                      <div
                        key={i}
                        className="pt-mini-avatar"
                        style={{ background: av.bg, color: av.color, zIndex: partner.avatars.length - i }}
                      >
                        {av.initials}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pt-notify">
                    <div className="pt-notify-icon">
                      <svg width="13" height="11" viewBox="0 0 24 24" fill="none" stroke="#0F5238" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <span className="pt-notify-text">{partner.footerNote}</span>
                  </div>
                )}
                {partner.footerAction ? (
                  <button className="pt-review-btn">{partner.footerAction}</button>
                ) : (
                  <span className="pt-footer-italic">{partner.footerNote}</span>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Sidebar ── */}
      <div className="pt-sidebar">

        {/* Quick Filters */}
        <div className="pt-filter-card">
          <div className="pt-filter-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" fill="#0F5238"/>
            </svg>
            <span>Quick Filters</span>
          </div>
          <div className="pt-toggles">
            <div className="pt-toggle-row">
              <span className="pt-toggle-label">Pending Verification</span>
              <button
                className={`pt-toggle ${pendingVerification ? 'pt-toggle--on' : 'pt-toggle--off'}`}
                onClick={() => setPendingVerification(v => !v)}
                aria-pressed={pendingVerification}
              >
                <div className="pt-toggle-knob"></div>
              </button>
            </div>
            <div className="pt-toggle-row">
              <span className="pt-toggle-label">Untagged Users</span>
              <button
                className={`pt-toggle ${untaggedUsers ? 'pt-toggle--on' : 'pt-toggle--off'}`}
                onClick={() => setUntaggedUsers(v => !v)}
                aria-pressed={untaggedUsers}
              >
                <div className="pt-toggle-knob"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Category Tags */}
        <div className="pt-filter-card">
          <div className="pt-filter-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#191C1A" strokeWidth="1.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <circle cx="7" cy="7" r="1.5" fill="#191C1A"></circle>
            </svg>
            <span>Category Tags</span>
          </div>
          <div className="pt-cat-tags">
            {CATEGORY_TAGS.map(tag => (
              <button
                key={tag.id}
                className={`pt-cat-tag ${activeTagIds.includes(tag.id) ? 'pt-cat-tag--active' : ''}`}
                onClick={() => toggleCatTag(tag.id)}
              >
                {tag.label}
              </button>
            ))}
            <button className="pt-cat-tag-add">+ Add Tag</button>
          </div>
        </div>

      </div>
    </div>
  );
}
