import { useEffect, useState } from 'react';
import './AdminUserManagement.css';
import { adminAPI, charityApplicationsAPI } from '../api/apis';

const USERS_PER_PAGE = 10;
type RoleFilter = 'all' | 'seller' | 'buyer' | 'charity' | 'admin';

type User = {
  userID: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  role: 'buyer' | 'seller' | 'charity' | 'admin';
  barangay?: string;
  city?: string;
  createdAt?: string;
  created_at?: string;
};

type PendingApproval = {
  applicationID: string;
  status: string;
  userID?: string;
  organizationName?: string;
};

export default function AdminUserManagement() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedUser = users.find((u) => u.userID === selectedUserId) || null;
  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
  const pageStart = (currentPage - 1) * USERS_PER_PAGE;

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, pendingRes] = await Promise.all([
        adminAPI.getUsers(currentPage, USERS_PER_PAGE, roleFilter === 'all' ? undefined : roleFilter),
        charityApplicationsAPI.getPending(),
      ]);
      const fetchedUsers = usersRes.data?.users ?? [];
      setUsers(fetchedUsers);
      setTotalUsers(usersRes.data?.total ?? 0);
      setPendingApprovals(pendingRes.data ?? []);
      if (!selectedUserId && fetchedUsers.length > 0) setSelectedUserId(fetchedUsers[0].userID);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [currentPage, roleFilter]);

  const goTo = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const changeRole = async (user: User) => {
    const order: User['role'][] = ['buyer', 'seller', 'charity', 'admin'];
    const nextRole = order[(order.indexOf(user.role) + 1) % order.length];
    await adminAPI.updateUserRole(user.userID, nextRole);
    await loadData();
  };

  const reviewPending = async (applicationID: string, status: 'approved' | 'rejected') => {
    await charityApplicationsAPI.review(applicationID, status === 'approved' ? { status, organizationName: 'Approved Organization' } : { status });
    await loadData();
  };

  return (
    <div className="user-management-grid">
      <div className="user-table-column">
        <div className="user-filters-row">
          <div className="filter-chips">
            <button className={`chip-btn ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => { setRoleFilter('all'); setCurrentPage(1); }}>All Users</button>
            <button className={`chip-btn ${roleFilter === 'seller' ? 'active' : ''}`} onClick={() => { setRoleFilter('seller'); setCurrentPage(1); }}>Sellers</button>
            <button className={`chip-btn ${roleFilter === 'buyer' ? 'active' : ''}`} onClick={() => { setRoleFilter('buyer'); setCurrentPage(1); }}>Buyers</button>
            <button className={`chip-btn ${roleFilter === 'charity' ? 'active' : ''}`} onClick={() => { setRoleFilter('charity'); setCurrentPage(1); }}>Charities</button>
            <button className={`chip-btn ${roleFilter === 'admin' ? 'active' : ''}`} onClick={() => { setRoleFilter('admin'); setCurrentPage(1); }}>Admins</button>
          </div>
          <button className="btn-invite" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Invite New User
          </button>
        </div>

        {loading && <p>Loading users...</p>}

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
                {users.map((user) => (
                  <tr key={user.userID} className={`user-row ${selectedUserId === user.userID ? 'selected' : ''}`} onClick={() => setSelectedUserId(user.userID)}>
                    <td>
                      <div className="td-user-info">
                        <div className="user-initials-sm">{`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}</div>
                        <div className="user-text">
                          <span className="user-name">{`${user.firstName} ${user.lastName}`}</span>
                          <span className="user-email">{user.emailAddress}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="user-role-badge">{user.role}</span></td>
                    <td>
                      <div className="user-status">
                        <span className="status-dot active"></span>
                        <span className="status-text active">Active</span>
                      </div>
                    </td>
                    <td><span className="user-date">{(user.createdAt || user.created_at) ? new Date((user.createdAt || user.created_at) as string).toLocaleDateString() : '-'}</span></td>
                    <td>
                      <button className="btn-icon-gray" onClick={(e) => { e.stopPropagation(); void changeRole(user); }}>
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
              Showing {users.length === 0 ? 0 : pageStart + 1}-{pageStart + users.length} of {totalUsers} users
            </span>

            <div className="pagination-controls">
              <button className="btn-page" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} className={`btn-page ${currentPage === page ? 'active' : ''}`} onClick={() => goTo(page)}>{page}</button>
              ))}
              <button className="btn-page" onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        </div>
      </div>

      <div className="user-sidebar-column">
        <div className="profile-summary-card">
          <div className="profile-bg-accent"></div>
          <div className="profile-header">
            <div className="profile-avatar-lg-wrapper">
              <div className="user-initials-lg">{selectedUser ? `${selectedUser.firstName?.[0] || ''}${selectedUser.lastName?.[0] || ''}` : '--'}</div>
              <div className="profile-status-indicator"></div>
            </div>
            <h3 className="profile-name">{selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'No user selected'}</h3>
            <p className="profile-role">{selectedUser?.role || '-'}</p>
            <span className="profile-cert-badge">Platform User</span>
          </div>
          <div className="profile-details">
            <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selectedUser?.emailAddress || '-'}</span></div>
            <div className="detail-row"><span className="detail-label">Location</span><span className="detail-value">{`${selectedUser?.barangay || ''} ${selectedUser?.city || ''}`.trim() || '-'}</span></div>
            <div className="detail-row"><span className="detail-label">Account Type</span><span className="detail-value">{selectedUser?.role || '-'}</span></div>
          </div>
          <div className="profile-actions">
            <button className="btn-action outline" disabled>View Logs</button>
            <button className="btn-action primary" disabled>Send Message</button>
          </div>
        </div>

        <div className="pending-card">
          <div className="pending-header">
            <h3>Pending Approvals</h3>
            <span className="pending-badge">{pendingApprovals.length} NEW</span>
          </div>
          <div className="pending-list">
            {pendingApprovals.map((app) => (
              <div className="pending-item" key={app.applicationID}>
                <div className="pending-info">
                  <h4>{app.organizationName || `Application ${app.applicationID.slice(0, 8)}`}</h4>
                  <p>{app.status}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn-page" onClick={() => { void reviewPending(app.applicationID, 'approved'); }}>Approve</button>
                    <button className="btn-page" onClick={() => { void reviewPending(app.applicationID, 'rejected'); }}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {pendingApprovals.length === 0 && <p>No pending approvals.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
