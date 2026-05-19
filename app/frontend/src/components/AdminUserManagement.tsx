import { useEffect, useState, useCallback, useRef } from 'react';
import './AdminUserManagement.css';
import { adminAPI, charityAPI } from '../api/apis';

const USERS_PER_PAGE = 10;
type RoleFilter = 'all' | 'seller' | 'buyer' | 'charity' | 'admin';
type UserRole = 'buyer' | 'seller' | 'charity' | 'admin';

const ALL_ROLES: UserRole[] = ['buyer', 'seller', 'admin', 'charity'];

type User = {
  userID: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  role: UserRole;
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

type ActivityLog = {
  activityID: string;
  actionType?: string;
  description?: string;
  timestamp: string;
};

export default function AdminUserManagement() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);

  const [userLogs, setUserLogs] = useState<ActivityLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [showPromoteAdminModal, setShowPromoteAdminModal] = useState(false);
  const [promoteAdminUserId, setPromoteAdminUserId] = useState<string | null>(null);
  const [promoteAdminForm, setPromoteAdminForm] = useState({ employeeID: '', adminType: '' });
  const [promoteAdminLoading, setPromoteAdminLoading] = useState(false);
  const [promoteAdminError, setPromoteAdminError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingUserId) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setEditingUserId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [editingUserId]);

  const selectedUser = users.find((u) => u.userID === selectedUserId) || null;
  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
  const pageStart = (currentPage - 1) * USERS_PER_PAGE;

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, pendingRes] = await Promise.all([
        adminAPI.getUsers(currentPage, USERS_PER_PAGE, roleFilter === 'all' ? undefined : roleFilter),
        charityAPI.getPendingApplications(),
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

  const applyRole = async (userId: string, newRole: User['role']) => {
    if (newRole === 'admin') {
      setPromoteAdminUserId(userId);
      setPromoteAdminForm({ employeeID: '', adminType: '' });
      setPromoteAdminError(null);
      setShowPromoteAdminModal(true);
      setEditingUserId(null);
    } else {
      await adminAPI.updateUserRole(userId, newRole);
      setEditingUserId(null);
      await loadData();
    }
  };

  const handlePromoteAdmin = async () => {
    if (!promoteAdminUserId) return;
    if (!promoteAdminForm.employeeID || !promoteAdminForm.adminType) {
      setPromoteAdminError('Both Employee ID and Admin Type are required.');
      return;
    }
    setPromoteAdminLoading(true);
    setPromoteAdminError(null);
    try {
      await adminAPI.updateUserRole(promoteAdminUserId, 'admin', promoteAdminForm.employeeID, promoteAdminForm.adminType);
      setShowPromoteAdminModal(false);
      setPromoteAdminUserId(null);
      setPromoteAdminForm({ employeeID: '', adminType: '' });
      await loadData();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setPromoteAdminError(detail ?? 'Failed to promote user to admin.');
    } finally {
      setPromoteAdminLoading(false);
    }
  };

  const deleteUser = async (user: User) => {
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) return;
    await adminAPI.deleteUser(user.userID);
    setSelectedUserId(null);
    setShowLogs(false);
    await loadData();
  };

  const reviewPending = async (applicationID: string, status: 'approved' | 'rejected') => {
    let organizationName: string | undefined;
    if (status === 'approved') {
      const name = window.prompt('Enter the organization name for this charity:');
      if (!name) return; // admin cancelled
      organizationName = name;
    }
    await charityAPI.reviewApplication(applicationID, { status, organizationName });
    await loadData();
  };

  const loadUserLogs = useCallback(async (userId: string) => {
    setLogsLoading(true);
    try {
      const res = await adminAPI.getAdminActivity({ userID: userId, limit: 20 });
      setUserLogs(res.data ?? []);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showLogs && selectedUserId) {
      void loadUserLogs(selectedUserId);
    }
  }, [showLogs, selectedUserId, loadUserLogs]);

  const toggleLogs = () => {
    if (!selectedUser) return;
    if (!showLogs) {
      setShowLogs(true);
      void loadUserLogs(selectedUser.userID);
    } else {
      setShowLogs(false);
    }
  };


  return (
    <>
    {showPromoteAdminModal && (
      <div className="modal-overlay" onClick={() => { setShowPromoteAdminModal(false); setPromoteAdminError(null); }}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Promote to Admin</h3>
            <button className="btn-icon-gray" onClick={() => { setShowPromoteAdminModal(false); setPromoteAdminError(null); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {promoteAdminError && <p className="modal-error">{promoteAdminError}</p>}
          <form onSubmit={(e) => { e.preventDefault(); void handlePromoteAdmin(); }}>
            <div className="modal-field">
              <label>Employee ID</label>
              <input required placeholder="e.g. EMP001" value={promoteAdminForm.employeeID} onChange={(e) => setPromoteAdminForm((f) => ({ ...f, employeeID: e.target.value }))} />
            </div>
            <div className="modal-field">
              <label>Admin Type</label>
              <select required value={promoteAdminForm.adminType} onChange={(e) => setPromoteAdminForm((f) => ({ ...f, adminType: e.target.value }))} >
                <option value="">Select admin type...</option>
                <option value="manager">Manager</option>
                <option value="moderator">Moderator</option>
                <option value="operator">Operator</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-action outline" onClick={() => { setShowPromoteAdminModal(false); setPromoteAdminError(null); }}>Cancel</button>
              <button type="submit" className="btn-action primary" disabled={promoteAdminLoading}>
                {promoteAdminLoading ? 'Promoting...' : 'Promote to Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    <div className="user-management-grid">
      <div className="user-table-column">
        <div className="user-filters-row">
          <div className="filter-chips">
            <button className={`chip-btn ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => { setRoleFilter('all'); setCurrentPage(1); }}>All Users</button>
            <button className={`chip-btn ${roleFilter === 'buyer' ? 'active' : ''}`} onClick={() => { setRoleFilter('buyer'); setCurrentPage(1); }}>Buyers</button>
            <button className={`chip-btn ${roleFilter === 'seller' ? 'active' : ''}`} onClick={() => { setRoleFilter('seller'); setCurrentPage(1); }}>Sellers</button>
            <button className={`chip-btn ${roleFilter === 'charity' ? 'active' : ''}`} onClick={() => { setRoleFilter('charity'); setCurrentPage(1); }}>Charities</button>
            <button className={`chip-btn ${roleFilter === 'admin' ? 'active' : ''}`} onClick={() => { setRoleFilter('admin'); setCurrentPage(1); }}>Admins</button>
          </div>
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
                      <div style={{ display: 'flex', gap: '4px', position: 'relative' }} ref={editingUserId === user.userID ? pickerRef : null}>
                        <button
                          className={`btn-icon-gray${editingUserId === user.userID ? ' btn-icon-gray--active' : ''}`}
                          title="Options"
                          onClick={(e) => { e.stopPropagation(); setEditingUserId(editingUserId === user.userID ? null : user.userID); }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                          </svg>
                        </button>

                        {editingUserId === user.userID && (
                          <div className="role-picker">
                            <p className="role-picker-label">Assign role</p>
                            {ALL_ROLES.map((role) => (
                              <button
                                key={role}
                                className={`role-option${user.role === role ? ' role-option--active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); void applyRole(user.userID, role); }}
                              >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                {user.role === role && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: 'auto' }}>
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        <button className="btn-icon-gray" title="Delete user" onClick={(e) => { e.stopPropagation(); void deleteUser(user); }} style={{ color: '#ef4444' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14H6L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M9 6V4h6v2"></path>
                          </svg>
                        </button>
                      </div>
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
            <button className="btn-action outline" onClick={toggleLogs} disabled={!selectedUser}>
              {showLogs ? 'Hide Logs' : 'View Logs'}
            </button>
            {/* <button className="btn-action primary" disabled>Send Message</button> */}
          </div>
        </div>

        {showLogs && (
          <div className="pending-card">
            <div className="pending-header">
              <h3>Activity Logs</h3>
              <span className="pending-badge">{userLogs.length}</span>
            </div>
            <div className="pending-list" style={{ maxHeight: '260px', overflowY: 'auto' }}>
              {logsLoading && <p>Loading logs...</p>}
              {!logsLoading && userLogs.length === 0 && <p>No activity recorded for this user.</p>}
              {!logsLoading && userLogs.map((log) => (
                <div className="pending-item" key={log.activityID}>
                  <div className="pending-info">
                    <h4>{log.description || log.actionType || 'Action'}</h4>
                    <p>{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
    </>
  );
}
