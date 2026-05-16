import { useEffect, useState } from 'react';
import './AdminPartnerTagging.css';
import { adminAPI } from '../api/apis';

import BakeryImg from '../assets/ADMIN/Partner tagging/Bakery.svg';
import CommunityImg from '../assets/ADMIN/Partner tagging/community.svg';

type SellerRecord = {
  userID: string;
  isVerified?: boolean;
  companyName?: string;
  tags?: string[];
  user?: {
    firstName?: string;
    lastName?: string;
    barangay?: string;
    city?: string;
  };
};

export default function AdminPartnerTagging() {
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [pendingVerification, setPendingVerification] = useState(true);
  const [untaggedUsers, setUntaggedUsers] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const loadSellers = async () => {
    const res = await adminAPI.getSellers();
    setSellers(res.data ?? []);
  };

  useEffect(() => {
    void loadSellers();
  }, []);

  const updateTags = async (sellerId: string, tags: string[]) => {
    await adminAPI.updateSellerTags(sellerId, tags);
    await loadSellers();
  };

  const allTags = Array.from(new Set(sellers.flatMap((s) => s.tags || [])));
  const filtered = sellers.filter((s) => {
    if (pendingVerification && s.isVerified) return false;
    if (untaggedUsers && (s.tags || []).length > 0) return false;
    if (activeTags.length > 0 && !activeTags.every((t) => (s.tags || []).includes(t))) return false;
    return true;
  });

  const toggleCatTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <div className="pt-layout">
      <div className="pt-list">
        {filtered.map((seller, idx) => (
          <div className="pt-card" key={seller.userID}>
            <div className="pt-img-col">
              <img src={idx % 2 === 0 ? BakeryImg : CommunityImg} alt={seller.companyName || 'Seller'} className="pt-img" />
              <span className={`pt-badge pt-badge--${seller.isVerified ? 'seller' : 'pending'}`}>{seller.isVerified ? 'SELLER' : 'PENDING'}</span>
            </div>

            <div className="pt-content">
              <div className="pt-header-row">
                <div className="pt-name-block">
                  <h3 className="pt-name">{seller.companyName || `${seller.user?.firstName || ''} ${seller.user?.lastName || ''}`.trim() || 'Seller'}</h3>
                  <div className="pt-location">
                    <svg width="9" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{`${seller.user?.barangay || ''} ${seller.user?.city || ''}`.trim() || 'No location'}</span>
                  </div>
                </div>
                <div className="pt-status-block">
                  <span className={`pt-status-chip pt-status-chip--${seller.isVerified ? 'verified' : 'community'}`}>
                    {seller.isVerified ? 'Verified' : 'Community'}
                  </span>
                </div>
              </div>

              <div className="pt-tags-block">
                <span className="pt-tags-label">APPLIED TAGS</span>
                <div className="pt-tags-row">
                  {(seller.tags || []).map((tag) => (
                    <span className="pt-applied-tag" key={tag}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#66B018" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      </svg>
                      {tag}
                      <button className="pt-tag-remove" onClick={() => { void updateTags(seller.userID, (seller.tags || []).filter((t) => t !== tag)); }}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#66B018" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </span>
                  ))}
                  <button className="pt-add-tag-btn" onClick={() => {
                    const value = window.prompt('Add tag');
                    if (!value) return;
                    void updateTags(seller.userID, Array.from(new Set([...(seller.tags || []), value.trim()])));
                  }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="3">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Tag
                  </button>
                </div>
              </div>

              <div className="pt-footer">
                <span className="pt-footer-italic">Synced from seller profile</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p>No partners match selected filters.</p>}
      </div>

      <div className="pt-sidebar">
        <div className="pt-filter-card">
          <div className="pt-filter-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" fill="#66B018"/>
            </svg>
            <span>Quick Filters</span>
          </div>
          <div className="pt-toggles">
            <div className="pt-toggle-row">
              <span className="pt-toggle-label">Pending Verification</span>
              <button className={`pt-toggle ${pendingVerification ? 'pt-toggle--on' : 'pt-toggle--off'}`} onClick={() => setPendingVerification((v) => !v)} aria-pressed={pendingVerification}><div className="pt-toggle-knob"></div></button>
            </div>
            <div className="pt-toggle-row">
              <span className="pt-toggle-label">Untagged Users</span>
              <button className={`pt-toggle ${untaggedUsers ? 'pt-toggle--on' : 'pt-toggle--off'}`} onClick={() => setUntaggedUsers((v) => !v)} aria-pressed={untaggedUsers}><div className="pt-toggle-knob"></div></button>
            </div>
          </div>
        </div>

        <div className="pt-filter-card">
          <div className="pt-filter-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#191C1A" strokeWidth="1.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <circle cx="7" cy="7" r="1.5" fill="#191C1A"></circle>
            </svg>
            <span>Category Tags</span>
          </div>
          <div className="pt-cat-tags">
            {allTags.map((tag) => (
              <button key={tag} className={`pt-cat-tag ${activeTags.includes(tag) ? 'pt-cat-tag--active' : ''}`} onClick={() => toggleCatTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
