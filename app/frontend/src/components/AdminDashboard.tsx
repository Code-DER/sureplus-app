import './AdminDashboard.css';

interface AdminDashboardProps {
  onSwitchRole: (role: 'buyer' | 'seller' | 'admin') => void;
}

const ACTIVITIES = [
  {
    id: 1,
    event: 'New Bulk Rescue Order',
    subEvent: 'Order #88241 — "Green Market Co."',
    actor: 'Osamu Dazai',
    actorAvatar: 'https://placehold.co/32x32/191C1A/FFFFFF?text=OD',
    status: 'Processed',
    statusType: 'success',
    time: '2 mins ago'
  },
  {
    id: 2,
    event: 'New Partner Registered',
    subEvent: '"Urban Harvest Organic"',
    actor: 'Levi Ackerman',
    actorAvatar: 'https://placehold.co/32x32/191C1A/FFFFFF?text=LA',
    status: 'Pending Review',
    statusType: 'neutral',
    time: '14 mins ago'
  },
  {
    id: 3,
    event: 'System Update Deployed',
    subEvent: 'Version 2.4.0 — Search Optimization',
    actor: 'Toji Fushiguro',
    actorAvatar: 'https://placehold.co/32x32/191C1A/FFFFFF?text=TF',
    status: 'Automatic',
    statusType: 'neutral',
    time: '1 hour ago'
  }
];

export default function AdminDashboard({ onSwitchRole }: AdminDashboardProps) {
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
          <a className="admin-nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>
          <a className="admin-nav-item">
            <svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            User Management
          </a>
          <a className="admin-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Partner Tagging
          </a>
          <a className="admin-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Reports
          </a>
          <a className="admin-nav-item">
            <svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Inbox
          </a>
          
          <button className="btn-back-to-app" onClick={() => onSwitchRole('buyer')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to App
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="admin-main-content">
        <div className="admin-dashboard-card">
          
          {/* Stat Cards Row */}
          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <div className="stat-header">
                <span className="stat-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707973" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle></svg>
                </span>
                <span className="stat-badge positive">↗ +12.5%</span>
              </div>
              <p className="stat-label">TOTAL REVENUE</p>
              <h3 className="stat-value">₱42,920.00</h3>
            </div>
            
            <div className="admin-stat-card">
              <div className="stat-header">
                <span className="stat-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707973" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                </span>
                <span className="stat-badge positive">↗ +8.2%</span>
              </div>
              <p className="stat-label">TOTAL USERS</p>
              <h3 className="stat-value">12,402</h3>
            </div>
            
            <div className="admin-stat-card">
              <div className="stat-header">
                <span className="stat-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707973" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </span>
                <span className="stat-badge negative">↘ -2.1%</span>
              </div>
              <p className="stat-label">ACTIVE PARTNERS</p>
              <h3 className="stat-value">842</h3>
            </div>
            
            <div className="admin-stat-card dark">
              <div className="stat-header">
                <span className="stat-icon-wrapper dark-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
                </span>
                <span className="stat-badge highlight">⚡ High Impact</span>
              </div>
              <p className="stat-label">FOOD RESCUED</p>
              <h3 className="stat-value">18,520 kg</h3>
            </div>
          </div>

          {/* Charts Row */}
          <div className="admin-charts-row">
            
            {/* Revenue Bar Chart */}
            <div className="chart-card bar-chart-card">
              <div className="chart-header">
                <h3>Revenue Overview</h3>
                <button className="dropdown-btn">Last 6 Months <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
              </div>
              <div className="bar-chart-container">
                <div className="bar-chart">
                  <div className="bar-col"><div className="bar" style={{height: '40%'}}></div><span>Jan</span></div>
                  <div className="bar-col"><div className="bar" style={{height: '50%'}}></div><span>Feb</span></div>
                  <div className="bar-col"><div className="bar" style={{height: '35%'}}></div><span>Mar</span></div>
                  <div className="bar-col"><div className="bar active" style={{height: '90%'}}></div><span className="active-label">Apr</span></div>
                  <div className="bar-col"><div className="bar" style={{height: '60%'}}></div><span>May</span></div>
                  <div className="bar-col"><div className="bar" style={{height: '70%'}}></div><span>Jun</span></div>
                </div>
              </div>
            </div>

            {/* Inventory Donut Chart */}
            <div className="chart-card donut-chart-card">
              <h3>Inventory Breakdown</h3>
              <div className="donut-wrapper">
                <div className="donut-chart"></div>
                <div className="donut-center">
                  <h4>2,410</h4>
                  <p>TOTAL ITEMS</p>
                </div>
              </div>
              <div className="donut-legend">
                <div className="legend-item">
                  <div className="legend-label"><span className="dot" style={{background: '#4CAF50'}}></span> Produce & Vegetables</div>
                  <span className="pct">45%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-label"><span className="dot" style={{background: '#90A4AE'}}></span> Bakery & Grains</div>
                  <span className="pct">30%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-label"><span className="dot" style={{background: '#CFD8DC'}}></span> Others</div>
                  <span className="pct">25%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="admin-activity-card">
            <div className="activity-header">
              <div>
                <h3>Recent Activity</h3>
                <p>Latest actions performed on the platform</p>
              </div>
              <button className="btn-outline">View All Logs</button>
            </div>
            
            <table className="activity-table">
              <thead>
                <tr>
                  <th>EVENT DETAILS</th>
                  <th>ACTOR</th>
                  <th>STATUS</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITIES.map(activity => (
                  <tr key={activity.id}>
                    <td>
                      <div className="td-event">
                        <div className="event-icon">
                          {activity.id === 1 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F5238" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>}
                          {activity.id === 2 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#404943" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>}
                          {activity.id === 3 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#404943" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>}
                        </div>
                        <div className="event-info">
                          <h4>{activity.event}</h4>
                          <p>{activity.subEvent}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="td-actor">
                        <img src={activity.actorAvatar} alt={activity.actor} />
                        <span>{activity.actor}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${activity.statusType}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td>
                      <span className="td-time">{activity.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
