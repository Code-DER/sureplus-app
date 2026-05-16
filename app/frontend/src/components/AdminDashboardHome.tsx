import { useEffect, useState } from 'react';
import { adminAPI } from '../api/apis';
import TotalRevenueIcon from '../assets/ADMIN/Dashboard/total revenue.svg';
import TotalUsersIcon from '../assets/ADMIN/Dashboard/total users.svg';
import TotalPartnersIcon from '../assets/ADMIN/Dashboard/total partners.svg';
import FoodRescuedIcon from '../assets/ADMIN/Dashboard/food rescued.svg';
import BulkRescueIcon from '../assets/ADMIN/Dashboard/bulk rescue order.svg';
import NewPartnerIcon from '../assets/ADMIN/Dashboard/new parter registered.svg';

type AdminStats = {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalCharities: number;
  pendingApplications: number;
  totalProducts: number;
};

type Activity = {
  activityID: string;
  actionType?: string;
  description?: string;
  targetEntity?: string;
  timestamp: string;
  userID: string;
};

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  totalSellers: 0,
  totalBuyers: 0,
  totalCharities: 0,
  pendingApplications: 0,
  totalProducts: 0,
};

export default function AdminDashboardHome() {
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsRes, activityRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getAdminActivity({ limit: 10 }),
        ]);
        setStats(statsRes.data ?? EMPTY_STATS);
        setActivities(activityRes.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const roleBars = [
    { label: 'Buyers', value: stats.totalBuyers },
    { label: 'Sellers', value: stats.totalSellers },
    { label: 'Charities', value: stats.totalCharities },
  ];
  const maxRole = Math.max(1, ...roleBars.map((r) => r.value));

  return (
    <div className="admin-dashboard-card">
      {loading && <p>Loading admin dashboard...</p>}

      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-icon-wrapper">
              <img src={TotalRevenueIcon} alt="" width="20" height="20" />
            </span>
            <span className="stat-badge positive">Live</span>
          </div>
          <p className="stat-label">TOTAL PRODUCTS</p>
          <h3 className="stat-value">{stats.totalProducts}</h3>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-icon-wrapper">
              <img src={TotalUsersIcon} alt="" width="20" height="20" />
            </span>
            <span className="stat-badge positive">Live</span>
          </div>
          <p className="stat-label">TOTAL USERS</p>
          <h3 className="stat-value">{stats.totalUsers}</h3>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-icon-wrapper">
              <img src={TotalPartnersIcon} alt="" width="20" height="20" />
            </span>
            <span className="stat-badge positive">Live</span>
          </div>
          <p className="stat-label">ACTIVE PARTNERS</p>
          <h3 className="stat-value">{stats.totalSellers}</h3>
        </div>

        <div className="admin-stat-card dark">
          <div className="stat-header">
            <span className="stat-icon-wrapper dark-icon">
              <img src={FoodRescuedIcon} alt="" width="20" height="20" />
            </span>
            <span className="stat-badge highlight">Pending</span>
          </div>
          <p className="stat-label">PENDING CHARITY APPS</p>
          <h3 className="stat-value">{stats.pendingApplications}</h3>
        </div>
      </div>

      <div className="admin-charts-row">
        <div className="chart-card bar-chart-card">
          <div className="chart-header">
            <h3>User Role Overview</h3>
            <button className="dropdown-btn">Live Data</button>
          </div>
          <div className="bar-chart-container">
            <div className="bar-chart">
              {roleBars.map((role, idx) => (
                <div className="bar-col" key={role.label}>
                  <div className={`bar ${idx === 2 ? 'active' : ''}`} style={{ height: `${Math.max(10, (role.value / maxRole) * 100)}%` }}></div>
                  <span className={idx === 2 ? 'active-label' : ''}>{role.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card donut-chart-card">
          <h3>Inventory Breakdown</h3>
          <div className="donut-wrapper">
            <div className="donut-chart"></div>
            <div className="donut-center">
              <h4>{stats.totalProducts}</h4>
              <p>TOTAL ITEMS</p>
            </div>
          </div>
          <div className="donut-legend">
            <div className="legend-item"><div className="legend-label"><span className="dot" style={{ background: '#4CAF50' }}></span> Buyers</div><span className="pct">{stats.totalBuyers}</span></div>
            <div className="legend-item"><div className="legend-label"><span className="dot" style={{ background: '#90A4AE' }}></span> Sellers</div><span className="pct">{stats.totalSellers}</span></div>
            <div className="legend-item"><div className="legend-label"><span className="dot" style={{ background: '#CFD8DC' }}></span> Charities</div><span className="pct">{stats.totalCharities}</span></div>
          </div>
        </div>
      </div>

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
            {activities.map((activity, idx) => (
              <tr key={activity.activityID}>
                <td>
                  <div className="td-event">
                    <div className="event-icon">
                      {idx % 2 === 0 ? <img src={BulkRescueIcon} alt="" width="16" height="16" /> : <img src={NewPartnerIcon} alt="" width="16" height="16" />}
                    </div>
                    <div className="event-info">
                      <h4>{activity.description || 'Admin action recorded'}</h4>
                      <p>{activity.targetEntity || 'System'}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="td-actor">
                    <span className="actor-initials">{activity.userID.slice(0, 2).toUpperCase()}</span>
                    <span>{activity.actionType || 'action'}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${activity.actionType === 'approve' ? 'success' : 'neutral'}`}>
                    {activity.actionType || 'Recorded'}
                  </span>
                </td>
                <td>
                  <span className="td-time">{new Date(activity.timestamp).toLocaleString()}</span>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={4}>No recent activity logs.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
