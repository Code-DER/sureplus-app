import TotalRevenueIcon from '../assets/ADMIN/Dashboard/total revenue.svg';
import TotalUsersIcon from '../assets/ADMIN/Dashboard/total users.svg';
import TotalPartnersIcon from '../assets/ADMIN/Dashboard/total partners.svg';
import FoodRescuedIcon from '../assets/ADMIN/Dashboard/food rescued.svg';
import BulkRescueIcon from '../assets/ADMIN/Dashboard/bulk rescue order.svg';
import NewPartnerIcon from '../assets/ADMIN/Dashboard/new parter registered.svg';

const ACTIVITIES = [
  {
    id: 1,
    event: 'New Bulk Rescue Order',
    subEvent: 'Order #88241 — "Green Market Co."',
    actor: 'Osamu Dazai',
    actorInitials: 'OD',
    status: 'Processed',
    statusType: 'success',
    time: '2 mins ago'
  },
  {
    id: 2,
    event: 'New Partner Registered',
    subEvent: '"Urban Harvest Organic"',
    actor: 'Levi Ackerman',
    actorInitials: 'LA',
    status: 'Pending Review',
    statusType: 'neutral',
    time: '14 mins ago'
  },
  {
    id: 3,
    event: 'System Update Deployed',
    subEvent: 'Version 2.4.0 — Search Optimization',
    actor: 'Toji Fushiguro',
    actorInitials: 'TF',
    status: 'Automatic',
    statusType: 'neutral',
    time: '1 hour ago'
  }
];

export default function AdminDashboardHome() {
  return (
    <div className="admin-dashboard-card">

      {/* Stat Cards Row */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-icon-wrapper">
              <img src={TotalRevenueIcon} alt="" width="20" height="20" />
            </span>
            <span className="stat-badge positive">↗ +12.5%</span>
          </div>
          <p className="stat-label">TOTAL REVENUE</p>
          <h3 className="stat-value">₱42,920.00</h3>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-icon-wrapper">
              <img src={TotalUsersIcon} alt="" width="20" height="20" />
            </span>
            <span className="stat-badge positive">↗ +8.2%</span>
          </div>
          <p className="stat-label">TOTAL USERS</p>
          <h3 className="stat-value">12,402</h3>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-icon-wrapper">
              <img src={TotalPartnersIcon} alt="" width="20" height="20" />
            </span>
            <span className="stat-badge negative">↘ -2.1%</span>
          </div>
          <p className="stat-label">ACTIVE PARTNERS</p>
          <h3 className="stat-value">842</h3>
        </div>

        <div className="admin-stat-card dark">
          <div className="stat-header">
            <span className="stat-icon-wrapper dark-icon">
              <img src={FoodRescuedIcon} alt="" width="20" height="20" />
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
              <div className="bar-col"><div className="bar" style={{ height: '40%' }}></div><span>Jan</span></div>
              <div className="bar-col"><div className="bar" style={{ height: '50%' }}></div><span>Feb</span></div>
              <div className="bar-col"><div className="bar" style={{ height: '35%' }}></div><span>Mar</span></div>
              <div className="bar-col"><div className="bar active" style={{ height: '90%' }}></div><span className="active-label">Apr</span></div>
              <div className="bar-col"><div className="bar" style={{ height: '60%' }}></div><span>May</span></div>
              <div className="bar-col"><div className="bar" style={{ height: '70%' }}></div><span>Jun</span></div>
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
              <div className="legend-label"><span className="dot" style={{ background: '#4CAF50' }}></span> Produce & Vegetables</div>
              <span className="pct">45%</span>
            </div>
            <div className="legend-item">
              <div className="legend-label"><span className="dot" style={{ background: '#90A4AE' }}></span> Bakery & Grains</div>
              <span className="pct">30%</span>
            </div>
            <div className="legend-item">
              <div className="legend-label"><span className="dot" style={{ background: '#CFD8DC' }}></span> Others</div>
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
                      {activity.id === 1 && <img src={BulkRescueIcon} alt="" width="16" height="16" />}
                      {activity.id === 2 && <img src={NewPartnerIcon} alt="" width="16" height="16" />}
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
                    <span className="actor-initials">{activity.actorInitials}</span>
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
  );
}
