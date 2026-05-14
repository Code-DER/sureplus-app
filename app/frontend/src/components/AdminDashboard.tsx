import { useState } from 'react';
import './AdminDashboard.css';
import AdminDashboardHome from './AdminDashboardHome';
import AdminUserManagement from './AdminUserManagement';
import AdminPartnerTagging from './AdminPartnerTagging';
import AdminReports from './AdminReports';
import AdminCharityApplications from './AdminCharityApplications';

interface AdminDashboardProps {
  onSwitchRole: (role: 'buyer' | 'seller' | 'admin') => void;
}

export default function AdminDashboard({ onSwitchRole }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'partners' | 'reports' | 'inbox' | 'charity-apps'>('dashboard');

  return (
    <div className="admin-container">
      
      {/* Floating Topbar */}
      <div className="admin-topbar-floating">
        <div className="topbar-left">
          <h2>Sureplus Admin</h2>
        </div>
        <div className="topbar-right">
          <button className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </button>
          <button className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </button>
          <div className="avatar-wrapper">
            <img src="https://placehold.co/32x32/191C1A/FFFFFF?text=Z" alt="Admin" className="admin-avatar" />
          </div>
        </div>
      </div>

      {/* Floating Sidebar */}
      <div className="admin-sidebar-floating">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <span className="icon-placeholder sureplus-icon">SP</span>
          </div>
          <div className="admin-brand-text">
            <h3>Sureplus</h3>
            <p>Admin Portal</p>
          </div>
        </div>

        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            User Management
          </button>
          <button className={`admin-nav-item ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Partner Tagging
          </button>
          <button className={`admin-nav-item ${activeTab === 'charity-apps' ? 'active' : ''}`} onClick={() => setActiveTab('charity-apps')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Charity Apps
          </button>
          <button className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Reports
          </button>
          <button className={`admin-nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
            <svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Inbox
          </button>
          
          <button className="btn-back-to-app" onClick={() => onSwitchRole('buyer')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to App
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="admin-main-content">
        {activeTab === 'dashboard'    && <AdminDashboardHome />}
        {activeTab === 'users'        && <AdminUserManagement />}
        {activeTab === 'partners'     && <AdminPartnerTagging />}
        {activeTab === 'charity-apps' && <AdminCharityApplications />}
        {activeTab === 'reports'      && <AdminReports />}
        {activeTab !== 'dashboard' && activeTab !== 'users' && activeTab !== 'partners' && activeTab !== 'charity-apps' && activeTab !== 'reports' && (
          <div className="admin-dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h3>Feature Under Development</h3>
          </div>
        )}
      </div>
    </div>
  );
}
