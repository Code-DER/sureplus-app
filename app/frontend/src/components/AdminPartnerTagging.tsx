import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api/apis';
import type { CharityResponse } from '../api/types';
import './AdminPartnerTagging.css';

import BakeryImg from '../assets/ADMIN/Partner tagging/Bakery.svg';
import CommunityImg from '../assets/ADMIN/Partner tagging/community.svg';

interface CharityWithUser extends CharityResponse {
  User?: {
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  isUpdating?: boolean;
}

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
  isUpdating?: boolean;
};

export default function AdminPartnerTagging() {
  const [mode, setMode] = useState<'sellers' | 'charities'>('sellers');
  
  // Seller State
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [pendingVerification, setPendingVerification] = useState(true);
  const [untaggedUsers, setUntaggedUsers] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [openSellerMenuId, setOpenSellerMenuId] = useState<string | null>(null);

  // Charity State
  const [charities, setCharities] = useState<CharityWithUser[]>([]);
  const [charityLoading, setCharityLoading] = useState(false);
  const [charityError, setCharityError] = useState<string | null>(null);
  const [editingCharity, setEditingCharity] = useState<CharityWithUser | null>(null);

  const loadSellers = async () => {
    try {
      setSellerLoading(true);
      const res = await adminAPI.getSellers();
      setSellers(res.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setSellerLoading(false);
    }
  };

  const fetchCharities = async () => {
    try {
      setCharityLoading(true);
      const response = await adminAPI.getCharities();
      setCharities(response.data);
      setCharityError(null);
    } catch (err) {
      console.error('Error fetching charities:', err);
      setCharityError('Failed to load charities.');
    } finally {
      setCharityLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'sellers') loadSellers();
    else fetchCharities();
  }, [mode]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.pt-menu-wrap')) return;
      setOpenSellerMenuId(null);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const updateTags = async (sellerId: string, tags: string[]) => {
    await adminAPI.updateSellerTags(sellerId, tags);
    await loadSellers();
  };

  const handleToggleSellerVerification = async (sellerId: string, currentStatus: boolean) => {
    try {
      setSellers(prev => prev.map(s =>
        s.userID === sellerId ? { ...s, isUpdating: true } : s
      ));
      await adminAPI.updateSellerVerification(sellerId, !currentStatus);
      setSellers(prev => prev.map(s =>
        s.userID === sellerId ? { ...s, isVerified: !currentStatus, isUpdating: false } : s
      ));
      setOpenSellerMenuId(null);
    } catch (err) {
      console.error('Error updating seller verification:', err);
      alert('Failed to update verification status.');
      setSellers(prev => prev.map(s =>
        s.userID === sellerId ? { ...s, isUpdating: false } : s
      ));
    }
  };

  const handleTogglePartner = async (userId: string, currentStatus: boolean) => {
    try {
      setCharities(prev => prev.map(c => 
        c.userID === userId ? { ...c, isUpdating: true } : c
      ));

      await adminAPI.togglePartnerStatus(userId, !currentStatus);

      setCharities(prev => prev.map(c => 
        c.userID === userId ? { ...c, isPartner: !currentStatus, isUpdating: false } : c
      ));
    } catch (err) {
      console.error('Error toggling partner status:', err);
      alert('Failed to update partner status.');
      setCharities(prev => prev.map(c => 
        c.userID === userId ? { ...c, isUpdating: false } : c
      ));
    }
  };

  const handleEditCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharity) return;
    try {
      await adminAPI.updateCharity(editingCharity.userID, { 
        organizationName: editingCharity.organizationName 
      });
      setEditingCharity(null);
      await fetchCharities();
    } catch (err) {
      console.error('Error updating charity:', err);
      alert('Failed to update charity.');
    }
  };

  const handleDeleteCharity = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this charity organization record? This will NOT delete the user account, but they will no longer be listed as a charity.')) return;
    try {
      await adminAPI.deleteCharity(userId);
      await fetchCharities();
    } catch (err) {
      console.error('Error deleting charity:', err);
      alert('Failed to delete charity.');
    }
  };

  const allTags = Array.from(new Set(sellers.flatMap((s) => s.tags || [])));
  const filteredSellers = sellers.filter((s) => {
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
        <div className="applications-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Partner Management</h2>
            <p>{mode === 'sellers' ? 'Manage seller tags and verification.' : 'Tag charities as partners to enable donations.'}</p>
          </div>
          <div className="mode-toggle" style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
             <button 
                onClick={() => setMode('sellers')}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: mode === 'sellers' ? 'white' : 'transparent', boxShadow: mode === 'sellers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
             >Sellers</button>
             <button 
                onClick={() => setMode('charities')}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: mode === 'charities' ? 'white' : 'transparent', boxShadow: mode === 'charities' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
             >Charities</button>
          </div>
        </div>

        {mode === 'sellers' ? (
          <>
            {filteredSellers.map((seller, idx) => (
              <div className="pt-card" key={seller.userID}>
                <div className="pt-img-col">
                  <img src={idx % 2 === 0 ? BakeryImg : CommunityImg} alt={seller.companyName || 'Seller'} className="pt-img" />
                  <span className={`pt-badge pt-badge--${seller.isVerified ? 'verified' : 'pending'}`}>{seller.isVerified ? 'VERIFIED' : 'PENDING'}</span>
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
                      <div className="pt-menu-wrap">
                        <button
                          className="pt-dots-btn"
                          title="Partner actions"
                          onClick={() => setOpenSellerMenuId(prev => prev === seller.userID ? null : seller.userID)}
                          disabled={seller.isUpdating}
                        >
                          <span aria-hidden="true">⋮</span>
                        </button>
                        {openSellerMenuId === seller.userID && (
                          <div className="pt-actions-menu">
                            <button
                              className="pt-actions-menu-btn"
                              onClick={() => void handleToggleSellerVerification(seller.userID, !!seller.isVerified)}
                              disabled={seller.isUpdating}
                            >
                              {seller.isUpdating ? 'Updating...' : (seller.isVerified ? 'Unverify' : 'Verify')}
                            </button>
                          </div>
                        )}
                      </div>
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
            {filteredSellers.length === 0 && !sellerLoading && <p>No partners match selected filters.</p>}
            {sellerLoading && <p>Loading sellers...</p>}
          </>
        ) : (
          <>
            {charityLoading ? (
              <div className="admin-applications-loading"><div className="spinner"></div><p>Loading charities...</p></div>
            ) : charityError ? (
              <div className="admin-applications-error"><p>{charityError}</p><button onClick={fetchCharities}>Retry</button></div>
            ) : charities.length === 0 ? (
              <div className="applications-empty">
                <p>No charities found.</p>
              </div>
            ) : (
              <div className="charities-management-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {charities.map(charity => (
                  <div key={charity.userID} className="pt-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div className="charity-info">
                        <h3 className="pt-name" style={{ marginBottom: '4px' }}>{charity.organizationName}</h3>
                        <div className="pt-location">
                          <span>{charity.User?.firstName} {charity.User?.lastName} ({charity.User?.emailAddress})</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className={`pt-status-chip ${charity.isPartner ? 'pt-status-chip--verified' : 'pt-status-chip--community'}`}>
                          {charity.isPartner ? 'Verified Partner' : 'Standard Charity'}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn-table btn-edit" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setEditingCharity(charity)}
                          >Edit</button>
                          <button 
                            className="btn-table btn-delete" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => handleDeleteCharity(charity.userID)}
                          >Delete</button>
                        </div>

                        <button 
                          className={`pt-toggle ${charity.isPartner ? 'pt-toggle--on' : 'pt-toggle--off'}`}
                          onClick={() => handleTogglePartner(charity.userID, charity.isPartner)}
                          disabled={charity.isUpdating}
                          title={charity.isPartner ? 'Untag as Partner' : 'Tag as Partner'}
                        >
                          <div className="pt-toggle-knob"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {editingCharity && (
        <div className="modal-overlay" onClick={() => setEditingCharity(null)}>
          <div className="charity-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Edit Charity</h2>
              <button className="close-btn" onClick={() => setEditingCharity(null)}>&times;</button>
            </div>
            <form onSubmit={handleEditCharity}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Organization Name</label>
                  <input 
                    type="text" 
                    value={editingCharity.organizationName} 
                    onChange={e => setEditingCharity({ ...editingCharity, organizationName: e.target.value })} 
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setEditingCharity(null)}>Cancel</button>
                <button type="submit" className="confirm-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="pt-sidebar">
        {mode === 'sellers' ? (
          <>
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
          </>
        ) : (
          <div className="pt-filter-card">
            <div className="pt-filter-heading">
               <span>Summary</span>
            </div>
            <p>Total Charities: {charities.length}</p>
            <p>Partners: {charities.filter(c => c.isPartner).length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
