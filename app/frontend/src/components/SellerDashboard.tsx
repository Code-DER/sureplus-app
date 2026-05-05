import React, { useState } from 'react';
import './SellerDashboard.css';
import CreateNewListing from './CreateNewListing';
import ManageListings from './ManageListings';
import MysteryBox from './MysteryBox';
import SalesAnalytics from './SalesAnalytics';

interface SellerDashboardProps {
  onSwitchRole: () => void;
}

type SidebarTab = 'dashboard' | 'manage-listings' | 'create-new' | 'mystery-box' | 'sales-reports' | 'reviews';

const SIDEBAR_ICONS: Record<SidebarTab, React.ReactNode> = {
  'dashboard': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="0" y="0" width="8" height="6" rx="1" fill="currentColor"/><rect x="10" y="0" width="8" height="8" rx="1" fill="currentColor"/><rect x="0" y="8" width="8" height="10" rx="1" fill="currentColor"/><rect x="10" y="10" width="8" height="8" rx="1" fill="currentColor"/></svg>
  ),
  'manage-listings': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 18c-.55 0-1.02-.196-1.413-.587A1.926 1.926 0 011 16V5.392c-.3-.184-.542-.421-.725-.713A1.82 1.82 0 010 3.5V.5C0-.05.196-.52.588-.913A1.926 1.926 0 012 -1.5h16c.55 0 1.02.196 1.413.587.391.392.587.863.587 1.413v3c0 .383-.092.72-.275 1.012A2.144 2.144 0 0119 5.392V16c0 .55-.196 1.02-.587 1.413A1.926 1.926 0 0117 18H3zm0-12v10h14V6H3zM2 4h16V1H2v3zm5 7h6V9H7v2z" fill="currentColor"/></svg>
  ),
  'create-new': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M9 15h2v-4h4V9h-4V5H9v4H5v2h4v4zm1 5c-1.383 0-2.683-.262-3.9-.787a10.14 10.14 0 01-3.175-2.138 10.14 10.14 0 01-2.137-3.175A9.707 9.707 0 010 10c0-1.383.263-2.683.788-3.9a10.14 10.14 0 012.137-3.175A10.14 10.14 0 016.1.788 9.707 9.707 0 0110 0c1.383 0 2.683.263 3.9.788a10.14 10.14 0 013.175 2.137 10.14 10.14 0 012.137 3.175A9.707 9.707 0 0120 10c0 1.383-.263 2.683-.788 3.9a10.14 10.14 0 01-2.137 3.175 10.14 10.14 0 01-3.175 2.138A9.707 9.707 0 0110 20zm0-2c2.233 0 4.125-.775 5.675-2.325C17.225 14.125 18 12.233 18 10s-.775-4.125-2.325-5.675C14.125 2.775 12.233 2 10 2S5.875 2.775 4.325 4.325C2.775 5.875 2 7.767 2 10s.775 4.125 2.325 5.675C5.875 17.225 7.767 18 10 18z" fill="currentColor"/></svg>
  ),
  'mystery-box': (
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none"><path d="M2 12h16v-2H2v2zm0-10h4.2c-.117-.15-.17-.308-.2-.475A2.5 2.5 0 016 1c0-.833.292-1.542.875-2.125A2.893 2.893 0 019-2.5c.5 0 .963.13 1.388.387.425.258.792.58 1.112.963l.5.65.5-.65c.3-.4.667-.725 1.1-.975.433-.25.9-.375 1.4-.375.833 0 1.542.292 2.125.875A2.893 2.893 0 0118.5 1c0 .183-.012.358-.037.525S18.383 1.85 18.3 2H20c.55 0 1.02.196 1.413.587.391.392.587.863.587 1.413v12c0 .55-.196 1.02-.587 1.413A1.926 1.926 0 0120 18H2c-.55 0-1.02-.196-1.413-.587A1.926 1.926 0 010 16V4c0-.55.196-.854.588-1.246A1.926 1.926 0 012 2zm0 7h16V4H12.9l2.1 2.85-1.6 1.15L10 3.4 6.6 8 5 6.85 7.05 4H2v5zm5 2c.283 0 .52-.096.713-.288A.968.968 0 008 1c0-.283-.096-.52-.288-.713A.968.968 0 007 0c-.283 0-.52.096-.713.288A.968.968 0 006 1c0 .283.096.52.288.713.191.191.429.287.712.287zm6 0c.283 0 .52-.096.713-.288A.968.968 0 0014 1c0-.283-.096-.52-.288-.713A.968.968 0 0013 0c-.283 0-.52.096-.713.288A.968.968 0 0012 1c0 .283.096.52.288.713.191.191.429.287.712.287z" fill="currentColor"/></svg>
  ),
  'sales-reports': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 14h2V9H4v5zm6 0h2V4h-2v10zm-3 0h2v-3H7v3zm0-5h2V7H7v2zM2 18c-.55 0-1.02-.196-1.413-.587A1.926 1.926 0 010 16V2C0 1.45.196.98.588.587A1.926 1.926 0 012 0h14c.55 0 1.02.196 1.413.587.391.392.587.863.587 1.413v14c0 .55-.196 1.02-.587 1.413A1.926 1.926 0 0116 18H2zM2 16h14V2H2v14z" fill="currentColor"/></svg>
  ),
  'reviews': (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7.6 15.317l2.15-1.567 2.4 1.567-.9-2.75 2.25-2H11.45L10 7.6l-1.45 2.967H6.35l2.15 2H4.825L6.15 13.067l-1.1 5.6L10 15.967l5.175 2.7-1.35-5.6 4.35-3.4H13.6L12 4.667l-2.4 8H5l-1.85 3.4-2.15 4.25L10 16z" fill="currentColor"/></svg>
  ),
};

const SIDEBAR_ITEMS: { id: SidebarTab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'manage-listings', label: 'Manage Listings' },
  { id: 'create-new', label: 'Create New' },
  { id: 'mystery-box', label: 'Mystery Box' },
  { id: 'sales-reports', label: 'Sales Reports' },
  { id: 'reviews', label: 'Reviews' },
];

const MOCK_LISTINGS = [
  {
    name: 'Bell Peppers ni ano',
    quantity: '24 pcs',
    price: '₱120.00',
    status: 'active' as const,
  },
  {
    name: 'Pandesal ni Zoro',
    quantity: '48 bags',
    price: '₱80.50',
    status: 'expiring' as const,
  },
  {
    name: 'Organic Mangoes',
    quantity: '36 pcs',
    price: '₱150.00',
    status: 'sold out' as const,
  },
];

const MOCK_FEED = [
  {
    type: 'sale' as const,
    text: 'Bell Peppers — 3 units sold',
    time: '2 minutes ago',
  },
  {
    type: 'expiring' as const,
    text: 'Pandesal batch expires in 6h',
    time: '15 min ago',
  },
  {
    type: 'info' as const,
    text: 'New review from @maria_buyer',
    time: '1 hour ago',
  },
];

export default function SellerDashboard({ onSwitchRole }: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');

  return (
    <div className="seller-page">
      {/* ===== TOP HEADER BAR ===== */}
      <header className="seller-header">
        <div className="seller-header-left">
          <span className="seller-header-title">Overview Dashboard</span>
        </div>
        <div className="seller-header-right">
          <button className="seller-icon-btn" aria-label="Notifications">
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none"><path d="M8 20c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2C9.5 1.17 8.83.5 8 .5S6.5 1.17 6.5 2v.68C3.64 3.36 2 5.92 2 9v5l-2 2v1h16v-1l-2-2z" fill="#6B7280"/></svg>
          </button>
          <button className="seller-icon-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 22a1 1 0 100-2 1 1 0 000 2zm11 0a1 1 0 100-2 1 1 0 000 2zM1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="seller-avatar" onClick={onSwitchRole} title="Switch to Buyer">
            <span>TM</span>
          </div>
        </div>
      </header>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="seller-body">
        {/* ===== SIDEBAR ===== */}
        <aside className="seller-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <span className="sidebar-logo-letter">S</span>
            </div>
            <div className="sidebar-brand-text">
              <h2>Sureplus</h2>
              <span>Seller Portal</span>
            </div>
          </div>

          <button className="btn-add-listing" onClick={() => setActiveTab('create-new')}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 1v15M1 8.5h15" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            Post Surplus Food
          </button>

          <nav className="sidebar-nav">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="sidebar-link-icon">{SIDEBAR_ICONS[item.id]}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="seller-main">
          {activeTab === 'create-new' ? (
            <CreateNewListing onBack={() => setActiveTab('dashboard')} />
          ) : activeTab === 'manage-listings' ? (
            <ManageListings onBack={() => setActiveTab('dashboard')} />
          ) : activeTab === 'mystery-box' ? (
            <MysteryBox onBack={() => setActiveTab('dashboard')} />
          ) : activeTab === 'sales-reports' ? (
            <SalesAnalytics onBack={() => setActiveTab('dashboard')} />
          ) : (
          <>
          {/* Statistics Bento Grid */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Total Sales</span>
                <div className="stat-card-icon green-bg">
                  <svg width="22" height="16" viewBox="0 0 22 16" fill="none"><path d="M1 8h3l3-7 4 14 3-7h3" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <div className="stat-card-body">
                <h3 className="stat-card-value">₱2,840.50</h3>
                <div className="stat-card-trend up">
                  <svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 6l5-5 5 5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>+12.5% from last week</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Food Saved</span>
                <div className="stat-card-icon orange-bg">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#EA580C" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              </div>
              <div className="stat-card-body">
                <h3 className="stat-card-value">142 kg</h3>
                <div className="stat-card-trend warning">
                  <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M5.5 1v11M1 7l4.5 5L10 7" stroke="#A04100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>Goal: 200 kg this month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Active Listings</span>
                <div className="stat-card-icon neutral-bg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="#52525B" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" stroke="#52525B" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" stroke="#52525B" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" stroke="#52525B" strokeWidth="2"/></svg>
                </div>
              </div>
              <div className="stat-card-body">
                <h3 className="stat-card-value">18 Items</h3>
                <div className="stat-card-trend neutral">
                  <span>4 expiring within 24h</span>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom section: Table + sidebar cards */}
          <div className="seller-bottom-grid">
            {/* Recent Listings Table */}
            <section className="listings-table-section">
              <div className="section-header">
                <h3>Recent Listings</h3>
                <button className="btn-see-all">See all</button>
              </div>
              <div className="listings-table-card">
                <table className="listings-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>QUANTITY</th>
                      <th>PRICE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_LISTINGS.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="product-cell">
                            <div className="product-thumb"></div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="qty-cell">{item.quantity}</td>
                        <td className="price-cell">{item.price}</td>
                        <td>
                          <span className={`status-badge ${item.status.replace(' ', '-')}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right sidebar cards */}
            <div className="seller-side-cards">
              {/* Impact Tracker */}
              <section className="impact-tracker-section">
                <h3 className="side-section-title">Impact Tracker</h3>
                <div className="impact-tracker-card">
                  <div className="impact-tracker-decoration"></div>
                  <h4>You're making a difference!</h4>
                  <p>142 kg of food rescued so far. Keep going to hit your 200 kg monthly goal.</p>
                  <div className="impact-progress-track">
                    <div className="impact-progress-bar" style={{ width: '75%' }}></div>
                  </div>
                  <span className="impact-progress-label">75% of monthly goal</span>
                </div>
              </section>

              {/* Live Feed */}
              <section className="live-feed-section">
                <h4 className="feed-heading">LIVE FEED</h4>
                <div className="feed-list">
                  {MOCK_FEED.map((item, idx) => (
                    <div className="feed-item" key={idx}>
                      <div className={`feed-dot ${item.type}`}></div>
                      <div className="feed-text">
                        <span className="feed-main">{item.text}</span>
                        <span className="feed-time">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );
}
