import React, { useState } from 'react';
import './ManageListings.css';
import EditListing from './EditListing';

interface ManageListingsProps {
  onBack: () => void;
}

interface ListingItem {
  id: number;
  name: string;
  category: string;
  categoryColor: 'green' | 'teal' | 'orange';
  rescuePrice: string;
  quantity: number;
  expiryText: string;
  expiryPercent: number;
  expiryUrgent: boolean;
  image: string;
}

const MOCK_ITEMS: ListingItem[] = [
  {
    id: 1,
    name: 'Artisanal Bakery Box (Surplus)',
    category: 'BAKERY',
    categoryColor: 'green',
    rescuePrice: '₱120.00',
    quantity: 4,
    expiryText: '2h 45m left',
    expiryPercent: 30,
    expiryUrgent: false,
    image: '🍞',
  },
  {
    id: 2,
    name: 'Mixed Greens & Grain Bowls',
    category: 'VEGAN',
    categoryColor: 'teal',
    rescuePrice: '₱80.50',
    quantity: 12,
    expiryText: '6h 20m left',
    expiryPercent: 75,
    expiryUrgent: false,
    image: '🥗',
  },
  {
    id: 3,
    name: 'Daily Special Meal Prep',
    category: 'URGENT',
    categoryColor: 'orange',
    rescuePrice: '₱150.00',
    quantity: 2,
    expiryText: 'Expiring soon!',
    expiryPercent: 95,
    expiryUrgent: true,
    image: '🍱',
  },
];

export default function ManageListings({ onBack }: ManageListingsProps) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<ListingItem[]>(MOCK_ITEMS);
  const [editingItem, setEditingItem] = useState<ListingItem | null>(null);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  if (editingItem) {
    return (
      <EditListing
        item={editingItem}
        onBack={() => setEditingItem(null)}
      />
    );
  }

  return (
    <div className="ml-page">
      {/* Header */}
      <div className="ml-header-section">
        <div className="ml-header-left">
          <nav className="ml-breadcrumb">
            <button className="ml-breadcrumb-link" onClick={onBack}>Dashboard</button>
            <svg className="ml-breadcrumb-sep" width="5" height="8" viewBox="0 0 5 8" fill="none"><path d="M1 1l3 3-3 3" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
          <button className="ml-filter-btn">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 1h12M3 5h8M5.5 9h3" stroke="#404943" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Filter
          </button>
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
            <span className="ml-stat-value ml-stat-value-green">24 Items</span>
          </div>
        </div>
        <div className="ml-stat-card">
          <div className="ml-stat-icon ml-stat-icon-orange">
            <svg width="18" height="21" viewBox="0 0 18 21" fill="none"><path d="M9 1v5l3-2M9 21c-4.97 0-9-4.03-9-9h2c0 3.87 3.13 7 7 7s7-3.13 7-7-3.13-7-7-7v4L4 4.5 9 0v3c4.97 0 9 4.03 9 9s-4.03 9-9 9z" fill="#EA580C"/></svg>
          </div>
          <div className="ml-stat-text">
            <span className="ml-stat-label">Expiring Today</span>
            <span className="ml-stat-value ml-stat-value-orange">8 Boxes</span>
          </div>
        </div>
        <div className="ml-stat-card">
          <div className="ml-stat-icon ml-stat-icon-teal">
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none"><path d="M3 17h15V7H3v10zM7 5V3h7v2H7zM1 7c0-1.1.9-2 2-2h15c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V7zm8 3h3v3h-3v-3z" fill="#006A6A"/></svg>
          </div>
          <div className="ml-stat-text">
            <span className="ml-stat-label">Food Rescued</span>
            <span className="ml-stat-value ml-stat-value-teal">142 kg</span>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="ml-table-container">
        {/* Table Header */}
        <div className="ml-table-header">
          <span className="ml-th ml-th-details">Item Details</span>
          <span className="ml-th ml-th-stock">Stock Level</span>
          <span className="ml-th ml-th-expiry">Expiry</span>
          <span className="ml-th ml-th-actions">Quick Actions</span>
        </div>

        {/* Table Items */}
        <div className="ml-table-body">
          {items.map((item, idx) => (
            <div
              className={`ml-table-row ${idx > 0 ? 'ml-row-border' : ''}`}
              key={item.id}
            >
              {/* Item Details */}
              <div className="ml-item-details" onClick={() => setEditingItem(item)} style={{ cursor: 'pointer' }}>
                <div className="ml-item-thumb">
                  <span className="ml-item-emoji">{item.image}</span>
                </div>
                <div className="ml-item-info">
                  <span className="ml-item-name">{item.name}</span>
                  <div className="ml-item-badges">
                    <span className={`ml-badge ml-badge-${item.categoryColor}`}>
                      {item.category}
                    </span>
                    <span className={`ml-badge-price ml-badge-price-${item.categoryColor}`}>
                      {item.rescuePrice} RESCUE PRICE
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Level */}
              <div className="ml-stock-control">
                <button
                  className="ml-stock-btn"
                  onClick={() => updateQuantity(item.id, -1)}
                  aria-label="Decrease"
                >
                  <svg width="10" height="2" viewBox="0 0 10 2" fill="none"><rect width="10" height="1.5" rx="0.75" fill="#A1A1AA"/></svg>
                </button>
                <span className="ml-stock-value">
                  {String(item.quantity).padStart(2, '0')}
                </span>
                <button
                  className="ml-stock-btn"
                  onClick={() => updateQuantity(item.id, 1)}
                  aria-label="Increase"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect y="4.25" width="10" height="1.5" rx="0.75" fill="#A1A1AA"/><rect x="4.25" width="1.5" height="10" rx="0.75" fill="#A1A1AA"/></svg>
                </button>
              </div>

              {/* Expiry */}
              <div className="ml-expiry-col">
                <div className="ml-expiry-text-row">
                  {item.expiryUrgent ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 13h12L7 1z" stroke="#EA580C" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 5.5v3M7 10.5v.5" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <span className="ml-expiry-urgent">{item.expiryText}</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.25" stroke="#71717A" strokeWidth="1.5"/><path d="M6 3v3.5l2.5 1" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      <span className="ml-expiry-normal">{item.expiryText}</span>
                    </>
                  )}
                </div>
                <div className="ml-expiry-bar-bg">
                  <div
                    className={`ml-expiry-bar-fill ${item.expiryUrgent ? 'urgent' : item.expiryPercent < 50 ? 'warning' : 'ok'}`}
                    style={{ width: `${item.expiryPercent}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="ml-actions-col">
                <button className="ml-mark-sold-btn" onClick={() => setEditingItem(item)}>Mark as Sold</button>
                <button className="ml-more-btn" aria-label="More options">
                  <svg width="4" height="16" viewBox="0 0 4 16" fill="none"><circle cx="2" cy="2" r="1.5" fill="#A1A1AA"/><circle cx="2" cy="8" r="1.5" fill="#A1A1AA"/><circle cx="2" cy="14" r="1.5" fill="#A1A1AA"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Pagination */}
        <div className="ml-table-footer">
          <span className="ml-footer-text">Showing 3 of 24 listings</span>
          <div className="ml-pagination">
            <button className="ml-page-btn disabled" disabled>
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6l5 5" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="ml-page-btn">
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#191C1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
