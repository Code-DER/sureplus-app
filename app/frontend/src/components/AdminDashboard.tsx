import { useState } from 'react';
import './AdminDashboard.css';
import AdminDashboardHome from './AdminDashboardHome';
import AdminUserManagement from './AdminUserManagement';
import AdminPartnerTagging from './AdminPartnerTagging';
import AdminReports from './AdminReports';
import AdminInbox from './AdminInbox';
import NotificationDropdown from './NotificationDropdown';

import StoreLogo from '../assets/ADMIN/Store Logo.svg';
import NotificationIcon from '../assets/ADMIN/notification.svg';
// import QuestionIcon from '../assets/ADMIN/Question.svg';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'partners' | 'reports' | 'inbox'>('dashboard');
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <div className="admin-container">
      
      {/* Floating Topbar */}
      <div className="admin-topbar-floating">
        <div className="topbar-left">
          <h2>Sureplus Admin</h2>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setShowNotifs((v) => !v); }} aria-label="Notifications">
            <img src={NotificationIcon} alt="Notifications" width="20" height="20" />
          </button>
          {showNotifs && <NotificationDropdown onClose={() => setShowNotifs(false)} />}
          {/* <button className="icon-btn">
            <img src={QuestionIcon} alt="Help" width="20" height="20" />
          </button> */}
          <div className="avatar-wrapper">
            <img src={StoreLogo} alt="Admin" className="admin-avatar" />
          </div>
        </div>
      </div>

      {/* Floating Sidebar */}
      <div className="admin-sidebar-floating">
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
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <img src={DashboardIcon} alt="" width="18" height="18" />
            Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <img src={UserManagementIcon} alt="" width="20" height="16" />
            User Management
          </button>
          <button className={`admin-nav-item ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>
            <img src={PartnerTaggingIcon} alt="" width="20" height="20" />
            Partner Tagging
          </button>
          <button className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <img src={ReportsIcon} alt="" width="18" height="18" />
            Reports
          </button>
          <button className={`admin-nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
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
        {activeTab === 'dashboard' && <AdminDashboardHome />}
        {activeTab === 'users'     && <AdminUserManagement />}
        {activeTab === 'partners'  && <AdminPartnerTagging />}
        {activeTab === 'reports'   && <AdminReports />}
        {activeTab === 'inbox'     && <AdminInbox />}
      </div>
    </div>
  );
}
