import { useState } from 'react';
import './AdminDashboard.css';
import AdminDashboardHome from './AdminDashboardHome';
import AdminUserManagement from './AdminUserManagement';
import AdminPartnerTagging from './AdminPartnerTagging';
import AdminReports from './AdminReports';
import AdminCharityApplications from './AdminCharityApplications';
import AdminCharityPosts from './AdminCharityPosts';
import AdminInbox from './AdminInbox';
import NotificationDropdown from './NotificationDropdown';

import StoreLogo from '../assets/ADMIN/Store Logo.svg';
import NotificationIcon from '../assets/ADMIN/notification.svg';
import QuestionIcon from '../assets/ADMIN/Question.svg';
import DashboardIcon from '../assets/ADMIN/Dashboard.svg';
import UserManagementIcon from '../assets/ADMIN/user management.svg';
import PartnerTaggingIcon from '../assets/ADMIN/Partner Tagging.svg';
import ReportsIcon from '../assets/ADMIN/Reports.svg';
import InboxIcon from '../assets/ADMIN/inbox.svg';
import LogoutIcon from '../assets/Global Profile System/Logout Icon.svg';

interface AdminDashboardProps {
  onSwitchRole: (role: 'buyer' | 'seller' | 'admin') => void;
}

export default function AdminDashboard({ onSwitchRole }: AdminDashboardProps) {
  void onSwitchRole;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'partners' | 'reports' | 'inbox' | 'charity-apps' | 'charity-posts'>('dashboard');
  const [showNotifs, setShowNotifs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-container">
      
      {/* Floating Topbar */}
      <div className="admin-topbar-floating">
        <div className="topbar-left">
          <button className="icon-btn admin-hamburger-btn admin-mobile-only" onClick={() => setSidebarOpen(v => !v)} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h2>Sureplus Admin</h2>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setShowNotifs((v) => !v); }} aria-label="Notifications">
            <img src={NotificationIcon} alt="Notifications" width="20" height="20" />
          </button>
          {showNotifs && <NotificationDropdown onClose={() => setShowNotifs(false)} />}
          <button className="icon-btn">
            <img src={QuestionIcon} alt="Help" width="20" height="20" />
          </button>
          <div className="avatar-wrapper">
            <img src={StoreLogo} alt="Admin" className="admin-avatar" />
          </div>
        </div>
      </div>

      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Floating Sidebar */}
      <div className={`admin-sidebar-floating${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <img src={StoreLogo} alt="Sureplus" width="40" height="40" style={{ borderRadius: 8 }} />
          </div>
          <div className="admin-brand-text">
            <h3>Sureplus</h3>
            <p>Admin Portal</p>
          </div>
        </div>

        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}>
            <img src={DashboardIcon} alt="" width="18" height="18" />
            Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}>
            <img src={UserManagementIcon} alt="" width="20" height="16" />
            User Management
          </button>
          <button className={`admin-nav-item ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => { setActiveTab('partners'); setSidebarOpen(false); }}>
            <img src={PartnerTaggingIcon} alt="" width="20" height="20" />
            Partner Tagging
          </button>
          <button className={`admin-nav-item ${activeTab === 'charity-apps' ? 'active' : ''}`} onClick={() => setActiveTab('charity-apps')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Charity Apps
          </button>
          <button className={`admin-nav-item ${activeTab === 'charity-posts' ? 'active' : ''}`} onClick={() => setActiveTab('charity-posts')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 21 2 21l0-5.5L17 3z"></path></svg>
            Charity Posts
          </button>
          <button className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <img src={ReportsIcon} alt="" width="18" height="18" />
            Reports
          </button>
          <button className={`admin-nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => { setActiveTab('inbox'); setSidebarOpen(false); }}>
            <img src={InboxIcon} alt="" width="20" height="16" />
            Inbox
          </button>
          <button className={'admin-nav-item'} onClick={() => {localStorage.clear(); window.location.href = '/';}}>
            <img src={LogoutIcon} alt="Logout" width="18" height="18" />
            Logout
          </button>
          
          {/* Remove for now */}
          {/* <button className="btn-back-to-app" onClick={() => onSwitchRole('buyer')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to App
          </button> */}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="admin-main-content">
        {activeTab === 'dashboard'    && <AdminDashboardHome />}
        {activeTab === 'users'        && <AdminUserManagement />}
        {activeTab === 'partners'     && <AdminPartnerTagging />}
        {activeTab === 'charity-apps' && <AdminCharityApplications />}
        {activeTab === 'charity-posts' && <AdminCharityPosts />}
        {activeTab === 'reports'      && <AdminReports />}
        {activeTab === 'inbox'        && <AdminInbox />}
      </div>
    </div>
  );
}
