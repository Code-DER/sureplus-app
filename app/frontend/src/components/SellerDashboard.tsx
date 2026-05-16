import { useState, useEffect, useCallback } from 'react';

import './SellerDashboard.css';
import UserAvatar from './UserAvatar';
import CreateNewListing from './CreateNewListing';
import ManageListings from './ManageListings';
import MysteryBox from './MysteryBox';
import SalesAnalytics from './SalesAnalytics';
import SellerReviews from './SellerReviews';
import { userAPI, foodAPI, notificationsAPI, purchasesAPI } from '../api/apis';
import type { FoodItem } from '../types/food';

interface SellerDashboardProps {
  onSwitchRole: () => void;
}

interface UserProfile {
  userID: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Purchase {
  purchaseID: string;
  totalPrice: number;
  status: string;
  purchaseDate?: string;
}

interface Notification {
  notificationID: string;
  title?: string;
  message?: string;
  type?: string;
  createdAt?: string;
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

export default function SellerDashboard({ onSwitchRole }: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<FoodItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      setLoading(true);
      try {
        const profileRes = await userAPI.getMyProfile();
        if (cancelled) return;
        const p = profileRes.data as UserProfile;
        setProfile(p);

        const [listingsRes, notifsRes] = await Promise.allSettled([
          foodAPI.list({ seller_id: p.userID, include_expired: true }),
          notificationsAPI.getMyNotifications(),
        ]);

        if (cancelled) return;
        if (listingsRes.status === 'fulfilled') setListings(listingsRes.value.data);
        if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data);

        const purchasesRes = await purchasesAPI.getSellerPurchases(p.userID).catch(() => null);
        if (!cancelled && purchasesRes) setPurchases(purchasesRes.data);
      } catch {
        // profile fetch failure is critical; sub-data failures are silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboardData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const sellerId = profile?.userID ?? '';

  const activeListings = listings.filter((l) => l.stockQuantity > 0);
  const expiringCount = listings.filter((l) => {
    if (!l.expirationDate) return false;
    const ms = new Date(l.expirationDate).getTime() - Date.now();
    return ms > 0 && ms < 24 * 60 * 60 * 1000;
  }).length;

  const completedPurchases = purchases.filter((p) => p.status === 'completed');
  const totalSales = completedPurchases.reduce((sum, p) => sum + Number(p.totalPrice), 0);

  const recentListings = [...listings]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  function feedType(n: Notification): 'sale' | 'expiring' | 'info' {
    const t = (n.type ?? '').toLowerCase();
    if (t.includes('sale') || t.includes('purchase') || t.includes('order')) return 'sale';
    if (t.includes('expir')) return 'expiring';
    return 'info';
  }

  function timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="seller-page">
      {/* ===== TOP HEADER BAR ===== */}
      <header className="seller-dashboard-header">
        <div className="seller-header-left">
          <span className="seller-header-title">Overview Dashboard</span>
        </div>
        <div className="seller-header-right">
          <button className="seller-dashboard-cta" type="button" onClick={onSwitchRole}>
            Browse Listings
          </button>
          <button className="seller-icon-btn" aria-label="Notifications">
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none"><path d="M8 20c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2C9.5 1.17 8.83.5 8 .5S6.5 1.17 6.5 2v.68C3.64 3.36 2 5.92 2 9v5l-2 2v1h16v-1l-2-2z" fill="#6B7280"/></svg>
          </button>
          <button className="seller-icon-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 16C4.9 16 4.01 16.9 4.01 18C4.01 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16ZM0 0V2H2L5.6 9.59L4.25 12.04C4.09 12.32 4 12.65 4 13C4 14.1 4.9 15 6 15H18V13H6.42C6.28 13 6.17 12.89 6.17 12.75L6.2 12.63L7.1 11H14.55C15.3 11 15.96 10.59 16.3 9.97L19.88 3.48C19.96 3.34 20 3.17 20 3C20 2.45 19.55 2 19 2H4.21L3.27 0H0ZM16 16C14.9 16 14.01 16.9 14.01 18C14.01 19.1 14.9 20 16 20C17.1 20 18 19.1 18 18C18 16.9 17.1 16 16 16Z" fill="#6B7280"/></svg>
          </button>
          <UserAvatar
            firstName={profile?.firstName}
            lastName={profile?.lastName}
            size={33}
            className="seller-header-avatar"
            onClick={onSwitchRole}
            title="Switch to Buyer"
          />
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
            <CreateNewListing
              onBack={() => setActiveTab('dashboard')}
              onCreated={() => { triggerRefresh(); setActiveTab('manage-listings'); }}
            />
          ) : activeTab === 'manage-listings' ? (
            <ManageListings
              onBack={() => setActiveTab('dashboard')}
              sellerId={sellerId}
            />
          ) : activeTab === 'mystery-box' ? (
            <MysteryBox onBack={() => setActiveTab('dashboard')} />
          ) : activeTab === 'sales-reports' ? (
            <SalesAnalytics onBack={() => setActiveTab('dashboard')} sellerId={sellerId} />
          ) : activeTab === 'reviews' ? (
            <SellerReviews
              onBack={() => setActiveTab('dashboard')}
              sellerId={sellerId}
            />
          ) : (
          <>
          {loading ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#707973' }}>
              Loading dashboard…
            </div>
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
                <h3 className="stat-card-value">
                  {purchases.length === 0 ? '₱0.00' : `₱${totalSales.toFixed(2)}`}
                </h3>
                <div className="stat-card-trend up">
                  <span>{completedPurchases.length} completed order{completedPurchases.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Expiring Soon</span>
                <div className="stat-card-icon orange-bg">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#EA580C" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              </div>
              <div className="stat-card-body">
                <h3 className="stat-card-value">{expiringCount} Items</h3>
                <div className="stat-card-trend warning">
                  <span>Expiring within 24 hours</span>
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
                <h3 className="stat-card-value">{activeListings.length} Items</h3>
                <div className="stat-card-trend neutral">
                  <span>{listings.length} total listing{listings.length !== 1 ? 's' : ''}</span>
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
                <button className="btn-see-all" onClick={() => setActiveTab('manage-listings')}>See all</button>
              </div>
              <div className="listings-table-card">
                {recentListings.length === 0 ? (
                  <p style={{ padding: '24px', color: '#707973', fontSize: 14, textAlign: 'center' }}>
                    No listings yet.{' '}
                    <button onClick={() => setActiveTab('create-new')} style={{ background: 'none', border: 'none', color: '#66B018', cursor: 'pointer', textDecoration: 'underline' }}>
                      Create your first listing
                    </button>
                  </p>
                ) : (
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
                      {recentListings.map((item) => {
                        const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();
                        const status: 'active' | 'expiring' | 'sold out' =
                          item.stockQuantity === 0 ? 'sold out'
                          : isExpired ? 'expiring'
                          : 'active';
                        return (
                          <tr key={item.foodID}>
                            <td>
                              <div className="product-cell">
                                {item.picture ? (
                                  <img
                                    src={item.picture}
                                    alt={item.foodName}
                                    className="product-thumb"
                                    style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }}
                                  />
                                ) : (
                                  <div className="product-thumb" />
                                )}
                                <span>{item.foodName}</span>
                              </div>
                            </td>
                            <td className="qty-cell">{item.stockQuantity} pcs</td>
                            <td className="price-cell">₱{Number(item.price).toFixed(2)}</td>
                            <td>
                              <span className={`status-badge ${status.replace(' ', '-')}`}>
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
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
                  <p>
                    {activeListings.length > 0
                      ? `${activeListings.length} active listing${activeListings.length !== 1 ? 's' : ''} helping reduce food waste.`
                      : 'Start listing surplus food to make an impact.'}
                  </p>
                  <div className="impact-progress-track">
                    <div
                      className="impact-progress-bar"
                      style={{ width: `${Math.min(listings.length * 5, 100)}%` }}
                    />
                  </div>
                  <span className="impact-progress-label">{listings.length} listing{listings.length !== 1 ? 's' : ''} created</span>
                </div>
              </section>

              {/* Live Feed */}
              <section className="live-feed-section">
                <h4 className="feed-heading">LIVE FEED</h4>
                <div className="feed-list">
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#A0ADA9', padding: '8px 0' }}>No recent activity.</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div className="feed-item" key={n.notificationID}>
                        <div className={`feed-dot ${feedType(n)}`}></div>
                        <div className="feed-text">
                          <span className="feed-main">{n.title ?? n.message ?? 'Notification'}</span>
                          <span className="feed-time">{timeAgo(n.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
          </>
          )}
          </>
          )}
        </main>
      </div>
    </div>
  );
}