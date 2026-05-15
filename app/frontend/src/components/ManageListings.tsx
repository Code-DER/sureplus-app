import { useState, useEffect, useCallback } from 'react';

import './ManageListings.css';
import EditListing from './EditListing';
import { foodAPI } from '../api/apis';
import type { FoodItem } from '../types/food';

interface ManageListingsProps {
  onBack: () => void;
  sellerId: string;
}

function getExpiryInfo(dateStr: string | null): { text: string; percent: number; urgent: boolean } {
  if (!dateStr) return { text: 'No expiry', percent: 100, urgent: false };
  const exp = new Date(dateStr);
  const now = new Date();
  const msLeft = exp.getTime() - now.getTime();
  const hoursLeft = msLeft / (1000 * 60 * 60);
  if (hoursLeft < 0) return { text: 'Expired', percent: 100, urgent: true };
  if (hoursLeft < 24) {
    const h = Math.floor(hoursLeft);
    const m = Math.floor((hoursLeft - h) * 60);
    return { text: `${h}h ${m}m left`, percent: 95, urgent: true };
  }
  const daysLeft = hoursLeft / 24;
  if (daysLeft <= 3) {
    return { text: `${Math.round(daysLeft)} days left`, percent: 70, urgent: false };
  }
  if (daysLeft <= 7) {
    return { text: `${Math.round(daysLeft)} days left`, percent: 50, urgent: false };
  }
  return { text: exp.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }), percent: 20, urgent: false };
}

function getApiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e?.response?.data?.detail ?? 'Something went wrong.';
}

export default function ManageListings({ onBack, sellerId }: ManageListingsProps) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await foodAPI.list({ seller_id: sellerId, include_expired: true });
      setItems(res.data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) fetchListings();
  }, [sellerId, fetchListings]);

  const updateQuantity = async (item: FoodItem, delta: number) => {
    const newQty = Math.max(0, item.stockQuantity + delta);
    setItems((prev) =>
      prev.map((i) => i.foodID === item.foodID ? { ...i, stockQuantity: newQty } : i)
    );
    setUpdatingId(item.foodID);
    try {
      await foodAPI.update(item.foodID, { stockQuantity: newQty });
    } catch {
      setItems((prev) =>
        prev.map((i) => i.foodID === item.foodID ? { ...i, stockQuantity: item.stockQuantity } : i)
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const markAsSold = async (item: FoodItem) => {
    setUpdatingId(item.foodID);
    try {
      await foodAPI.update(item.foodID, { stockQuantity: 0 });
      setItems((prev) =>
        prev.map((i) => i.foodID === item.foodID ? { ...i, stockQuantity: 0 } : i)
      );
    } catch {
      // revert silently
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteItem = async (foodID: string) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeletingId(foodID);
    try {
      await foodAPI.delete(foodID);
      setItems((prev) => prev.filter((i) => i.foodID !== foodID));
    } catch (err) {
      alert('Delete failed: ' + getApiError(err));
    } finally {
      setDeletingId(null);
      setOpenMenuId(null);
    }
  };

  if (editingItem) {
    return (
      <EditListing
        item={editingItem}
        onBack={() => setEditingItem(null)}
        onSaved={() => {
          setEditingItem(null);
          fetchListings();
        }}
      />
    );
  }

  const filtered = items.filter((i) =>
    i.foodName.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = items.filter((i) => i.stockQuantity > 0).length;
  const expiringToday = items.filter((i) => {
    if (!i.expirationDate) return false;
    const exp = new Date(i.expirationDate);
    const now = new Date();
    return exp.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="ml-page" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="ml-header-section">
        <div className="ml-header-left">
          <nav className="ml-breadcrumb">
            <button className="ml-breadcrumb-link" onClick={onBack}>Dashboard</button>
            <svg className="ml-breadcrumb-sep" width="5" height="8" viewBox="0 0 5 8" fill="none"><path d="M1 1l3 3-3 3" stroke="#66B018" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="ml-breadcrumb-current">Manage Listings</span>
          </nav>
          <h1 className="ml-title">Active Listings</h1>
          <p className="ml-subtitle">
            Manage your live food surplus inventory and impact real-time rescue operations.
          </p>
        </div>
        <div className="ml-header-right">
          <div className="ml-search-bar">
            <svg className="ml-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="5" stroke="#71717A" strokeWidth="1.5"/><path d="M10 10l3.5 3.5" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input
              className="ml-search-input"
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="ml-stats-row">
        <div className="ml-stat-card">
          <div className="ml-stat-icon ml-stat-icon-green">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M9 15h2v-4h4V9h-4V5H9v4H5v2h4v4zm1 5c-5.523 0-10-4.477-10-10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z" fill="#065F46"/></svg>
          </div>
          <div className="ml-stat-text">
            <span className="ml-stat-label">Live Listings</span>
            <span className="ml-stat-value ml-stat-value-green">{loading ? '—' : `${activeCount} Items`}</span>
          </div>
        </div>
        <div className="ml-stat-card">
          <div className="ml-stat-icon ml-stat-icon-orange">
            <svg width="18" height="21" viewBox="0 0 18 21" fill="none"><path d="M9 1v5l3-2M9 21c-4.97 0-9-4.03-9-9h2c0 3.87 3.13 7 7 7s7-3.13 7-7-3.13-7-7-7v4L4 4.5 9 0v3c4.97 0 9 4.03 9 9s-4.03 9-9 9z" fill="#EA580C"/></svg>
          </div>
          <div className="ml-stat-text">
            <span className="ml-stat-label">Expiring Today</span>
            <span className="ml-stat-value ml-stat-value-orange">{loading ? '—' : `${expiringToday} Items`}</span>
          </div>
        </div>
        <div className="ml-stat-card">
          <div className="ml-stat-icon ml-stat-icon-teal">
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none"><path d="M3 17h15V7H3v10zM7 5V3h7v2H7zM1 7c0-1.1.9-2 2-2h15c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V7zm8 3h3v3h-3v-3z" fill="#006A6A"/></svg>
          </div>
          <div className="ml-stat-text">
            <span className="ml-stat-label">Total Listings</span>
            <span className="ml-stat-value ml-stat-value-teal">{loading ? '—' : `${items.length} Items`}</span>
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#707973' }}>Loading listings…</div>
      )}
      {!loading && error && (
        <div style={{ padding: '20px', background: '#FFEBEE', borderRadius: 8, color: '#B71C1C', marginBottom: 16 }}>
          {error}
          <button onClick={fetchListings} style={{ marginLeft: 12, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#B71C1C' }}>Retry</button>
        </div>
      )}

      {/* Listings Table */}
      {!loading && !error && (
        <div className="ml-table-container">
          <div className="ml-table-header">
            <span className="ml-th ml-th-details">Item Details</span>
            <span className="ml-th ml-th-stock">Stock Level</span>
            <span className="ml-th ml-th-expiry">Expiry</span>
            <span className="ml-th ml-th-actions">Quick Actions</span>
          </div>

          <div className="ml-table-body">
            {filtered.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#707973' }}>
                {items.length === 0 ? 'No listings yet. Create your first listing!' : 'No items match your search.'}
              </div>
            ) : (
              filtered.map((item, idx) => {
                const expiry = getExpiryInfo(item.expirationDate);
                return (
                  <div
                    className={`ml-table-row ${idx > 0 ? 'ml-row-border' : ''}`}
                    key={item.foodID}
                  >
                    {/* Item Details */}
                    <div className="ml-item-details" onClick={() => setEditingItem(item)} style={{ cursor: 'pointer' }}>
                      <div className="ml-item-thumb">
                        {item.picture ? (
                          <img src={item.picture} alt={item.foodName} className="ml-item-icon" width="32" height="32" style={{ objectFit: 'cover', borderRadius: 4 }} />
                        ) : (
                          <div style={{ width: 32, height: 32, background: '#E8F0ED', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0ADA9" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-item-info">
                        <span className="ml-item-name">{item.foodName}</span>
                        <div className="ml-item-badges">
                          <span className="ml-badge ml-badge-green">
                            ₱{Number(item.price).toFixed(2)}
                          </span>
                          {item.stockQuantity === 0 && (
                            <span className="ml-badge ml-badge-orange">SOLD OUT</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock Level */}
                    <div className="ml-stock-control">
                      <button
                        className="ml-stock-btn"
                        onClick={() => updateQuantity(item, -1)}
                        disabled={updatingId === item.foodID || item.stockQuantity === 0}
                        aria-label="Decrease"
                      >
                        <svg width="10" height="2" viewBox="0 0 10 2" fill="none"><rect width="10" height="1.5" rx="0.75" fill="#A1A1AA"/></svg>
                      </button>
                      <span className="ml-stock-value">
                        {updatingId === item.foodID ? '…' : String(item.stockQuantity).padStart(2, '0')}
                      </span>
                      <button
                        className="ml-stock-btn"
                        onClick={() => updateQuantity(item, 1)}
                        disabled={updatingId === item.foodID}
                        aria-label="Increase"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect y="4.25" width="10" height="1.5" rx="0.75" fill="#A1A1AA"/><rect x="4.25" width="1.5" height="10" rx="0.75" fill="#A1A1AA"/></svg>
                      </button>
                    </div>

                    {/* Expiry */}
                    <div className="ml-expiry-col">
                      <div className="ml-expiry-text-row">
                        {expiry.urgent ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 13h12L7 1z" stroke="#EA580C" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 5.5v3M7 10.5v.5" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            <span className="ml-expiry-urgent">{expiry.text}</span>
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.25" stroke="#71717A" strokeWidth="1.5"/><path d="M6 3v3.5l2.5 1" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round"/></svg>
                            <span className="ml-expiry-normal">{expiry.text}</span>
                          </>
                        )}
                      </div>
                      <div className="ml-expiry-bar-bg">
                        <div
                          className={`ml-expiry-bar-fill ${expiry.urgent ? 'urgent' : expiry.percent < 50 ? 'warning' : 'ok'}`}
                          style={{ width: `${expiry.percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="ml-actions-col">
                      <button
                        className="ml-mark-sold-btn"
                        onClick={() => markAsSold(item)}
                        disabled={updatingId === item.foodID || item.stockQuantity === 0}
                      >
                        {updatingId === item.foodID ? '…' : 'Mark as Sold'}
                      </button>
                      <div style={{ position: 'relative' }}>
                        <button
                          className="ml-more-btn"
                          aria-label="More options"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === item.foodID ? null : item.foodID);
                          }}
                        >
                          <svg width="4" height="16" viewBox="0 0 4 16" fill="none"><circle cx="2" cy="2" r="1.5" fill="#A1A1AA"/><circle cx="2" cy="8" r="1.5" fill="#A1A1AA"/><circle cx="2" cy="14" r="1.5" fill="#A1A1AA"/></svg>
                        </button>
                        {openMenuId === item.foodID && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute', right: 0, top: '100%', zIndex: 10,
                              background: '#fff', border: '1px solid #E4E9E6', borderRadius: 8,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 140,
                            }}
                          >
                            <button
                              style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#191C1A' }}
                              onClick={() => { setEditingItem(item); setOpenMenuId(null); }}
                            >
                              Edit Listing
                            </button>
                            <button
                              style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#BA1A1A' }}
                              onClick={() => deleteItem(item.foodID)}
                              disabled={deletingId === item.foodID}
                            >
                              {deletingId === item.foodID ? 'Deleting…' : 'Delete Listing'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="ml-table-footer">
            <span className="ml-footer-text">Showing {filtered.length} of {items.length} listings</span>
          </div>
        </div>
      )}
    </div>
  );
}
