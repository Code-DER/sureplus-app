import { useState } from 'react';
import './AdminUserManagement.css';

const USERS_PER_PAGE = 10;

interface User {
  id: number;
  initials?: string;
  avatar?: string;
  name: string;
  email: string;
  role: string;
  status: string;
  dateJoined: string;
}

const USERS: User[] = [
  { id: 1,  initials: 'VC', name: 'Vic Calag',        email: 'vicc@greenmarket.com',       role: 'Seller',   status: 'Active',   dateJoined: 'Oct 12, 2025' },
  { id: 2,  initials: 'BU',
                             name: 'Buddha',            email: 'buddhaxdana@love.org',        role: 'Recycler', status: 'Active',   dateJoined: 'Nov 05, 2025' },
  { id: 3,  initials: 'LA', name: 'Levi Ackerman',    email: 'leevi@foodrescue.net',        role: 'Buyer',    status: 'Inactive', dateJoined: 'Jan 18, 2026' },
  { id: 4,  initials: 'DJ', name: 'Dana Jill',        email: 'dj@farmfresh.co',             role: 'Seller',   status: 'Active',   dateJoined: 'Feb 11, 2026' },
  { id: 5,  initials: 'MR', name: 'Maria Reyes',      email: 'maria@ecoloops.ph',           role: 'Buyer',    status: 'Active',   dateJoined: 'Mar 02, 2026' },
  { id: 6,  initials: 'JT', name: 'Jake Torres',      email: 'jake@harvestlink.com',        role: 'Seller',   status: 'Inactive', dateJoined: 'Mar 15, 2026' },
  { id: 7,  initials: 'SL', name: 'Sofia Lim',        email: 'sofia@greenloops.org',        role: 'Recycler', status: 'Active',   dateJoined: 'Mar 28, 2026' },
  { id: 8,  initials: 'AC', name: 'Arlo Cruz',        email: 'arlo@freshroots.net',         role: 'Buyer',    status: 'Active',   dateJoined: 'Apr 03, 2026' },
  { id: 9,  initials: 'NM', name: 'Nina Mendez',      email: 'nina@zerowaste.ph',           role: 'Seller',   status: 'Active',   dateJoined: 'Apr 10, 2026' },
  { id: 10, initials: 'RP', name: 'Rico Padilla',     email: 'rico@urbanfarm.co',           role: 'Recycler', status: 'Inactive', dateJoined: 'Apr 17, 2026' },
  { id: 11, initials: 'EV', name: 'Ella Villanueva',  email: 'ella@composthub.ph',          role: 'Buyer',    status: 'Active',   dateJoined: 'Apr 22, 2026' },
  { id: 12, initials: 'CM', name: 'Carlos Magno',     email: 'carlos@greengate.com',        role: 'Seller',   status: 'Active',   dateJoined: 'Apr 29, 2026' },
  { id: 13, initials: 'IR', name: 'Isabel Ramos',     email: 'isabel@rescuefood.net',       role: 'Recycler', status: 'Inactive', dateJoined: 'May 01, 2026' },
  { id: 14, initials: 'BN', name: 'Ben Navarro',      email: 'ben@sproutcoop.org',          role: 'Buyer',    status: 'Active',   dateJoined: 'May 04, 2026' },
  { id: 15, initials: 'GS', name: 'Grace Santos',     email: 'grace@leafcycle.ph',          role: 'Seller',   status: 'Active',   dateJoined: 'May 06, 2026' },
];

const PENDING_APPROVALS = [
  { id: 1, name: 'Urban Harvest Co.', type: 'Seller Application' },
  { id: 2, name: 'EcoCycle Ltd.',     type: 'Charity Application' },
];

export default function AdminUserManagement() {
  const [selectedUserId, setSelectedUserId] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(USERS.length / USERS_PER_PAGE);
  const pageStart  = (currentPage - 1) * USERS_PER_PAGE;
  const pageUsers  = USERS.slice(pageStart, pageStart + USERS_PER_PAGE);
  const showPagination = USERS.length > USERS_PER_PAGE;

  const goTo = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="user-management-grid">

      {/* Main Table */}
      <div className="user-table-column">

        <div className="user-filters-row">
          <div className="filter-chips">
            <button className="chip-btn active">All Users</button>
            <button className="chip-btn">Sellers</button>
            <button className="chip-btn">Buyers</button>
            <button className="chip-btn">Recyclers</button>
            <button className="chip-btn">Pending Approval</button>
          </div>
          <button className="btn-invite">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Invite New User
          </button>
        </div>

        <div className="user-table-card">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USER NAME</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>DATE JOINED</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.map(user => (
                  <tr
                    key={user.id}
                    className={`user-row ${selectedUserId === user.id ? 'selected' : ''}`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <td>
                      <div className="td-user-info">
                        {'avatar' in user && user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="user-avatar-sm" />
                        ) : (
                          <div className="user-initials-sm">{'initials' in user ? user.initials : ''}</div>
                        )}
                        <div className="user-text">
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="user-role-badge">{user.role}</span></td>
                    <td>
                      <div className="user-status">
                        <span className={`status-dot ${user.status.toLowerCase()}`}></span>
                        <span className={`status-text ${user.status.toLowerCase()}`}>{user.status}</span>
                      </div>
                    </td>
                    <td><span className="user-date">{user.dateJoined}</span></td>
                    <td>
                      <button className="btn-icon-gray">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-pagination">
            <span className="pagination-info">
              Showing {pageStart + 1}–{Math.min(pageStart + USERS_PER_PAGE, USERS.length)} of {USERS.length} users
            </span>

            {showPagination && (
              <div className="pagination-controls">
                <button
                  className="btn-page"
                  onClick={() => goTo(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`btn-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => goTo(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="btn-page"
                  onClick={() => goTo(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="user-sidebar-column">

        <div className="profile-summary-card">
          <div className="profile-bg-accent"></div>

          <div className="profile-header">
            <div className="profile-avatar-lg-wrapper">
              <div className="user-initials-lg">BU</div>
              <div className="profile-status-indicator"></div>
            </div>
            <h3 className="profile-name">Buddha</h3>
            <p className="profile-role">Primary Seller Partner</p>
            <span className="profile-cert-badge">Certified Green Partner</span>
          </div>

          <div className="profile-metrics">
            <div className="metric-box">
              <p className="metric-label">Impact Score</p>
              <h4 className="metric-value green">842 kg</h4>
              <p className="metric-sub">Rescued so far</p>
            </div>
            <div className="metric-box">
              <p className="metric-label">Orders</p>
              <h4 className="metric-value">128</h4>
              <p className="metric-sub">Total processed</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Location</span>
              <span className="detail-value">Sitio Basak</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Response Rate</span>
              <span className="detail-value">98.5%</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Account Type</span>
              <span className="detail-value">Organization</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-action outline">View Logs</button>
            <button className="btn-action primary">Send Message</button>
          </div>
        </div>

        <div className="analytics-bento">
          <div className="bento-header">
            <div className="icon-box">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
            </div>
            <span className="bento-title">REAL-TIME GROWTH</span>
          </div>
          <div className="bento-content">
            <h2 className="bento-value">+12.4%</h2>
            <p className="bento-subtitle">New user signups this month</p>
          </div>
          <div className="bento-chart-placeholder">
            <div className="bento-bar" style={{height: '40%', opacity: 0.2}}></div>
            <div className="bento-bar" style={{height: '60%', opacity: 0.3}}></div>
            <div className="bento-bar" style={{height: '45%', opacity: 0.4}}></div>
            <div className="bento-bar" style={{height: '80%', opacity: 0.6}}></div>
            <div className="bento-bar" style={{height: '70%', opacity: 0.8}}></div>
            <div className="bento-bar" style={{height: '95%', opacity: 1}}></div>
            <div className="bento-bar active" style={{height: '100%', background: '#FFFFFF'}}></div>
          </div>
        </div>

        <div className="pending-card">
          <div className="pending-header">
            <h3>Pending Approvals</h3>
            <span className="pending-badge">3 NEW</span>
          </div>
          <div className="pending-list">
            {PENDING_APPROVALS.map(app => (
              <div className="pending-item" key={app.id}>
                <div className="pending-icon-wrapper">
                  {app.id === 1 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  )}
                </div>
                <div className="pending-info">
                  <h4>{app.name}</h4>
                  <p>{app.type}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
