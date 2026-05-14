import React, { useEffect, useState } from 'react';
import { charityAPI } from '../api/apis';
import type { CharityApplicationResponse } from '../api/types';
import './AdminCharityApplications.css';

interface ApplicationWithReview extends CharityApplicationResponse {
  isReviewing?: boolean;
  orgNameInput?: string;
}

const AdminCharityApplications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // We need to add this endpoint to apis.ts
      const response = await charityAPI.getPendingApplications();
      setApplications(response.data.map((app: CharityApplicationResponse) => ({
        ...app,
        isReviewing: false,
        orgNameInput: ''
      })));
      setError(null);
    } catch (err) {
      console.error('Error fetching charity applications:', err);
      setError('Failed to load pending applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (applicationId: string, status: 'approved' | 'rejected', orgName?: string) => {
    try {
      setApplications(prev => prev.map(app => 
        app.applicationID === applicationId ? { ...app, isReviewing: true } : app
      ));

      await charityAPI.reviewApplication(applicationId, {
        status,
        organizationName: orgName
      });

      setApplications(prev => prev.filter(app => app.applicationID !== applicationId));
    } catch (err) {
      console.error('Error reviewing application:', err);
      alert('Failed to review application. Please try again.');
      setApplications(prev => prev.map(app => 
        app.applicationID === applicationId ? { ...app, isReviewing: false } : app
      ));
    }
  };

  if (loading) return <div className="admin-applications-loading"><div className="spinner"></div><p>Loading applications...</p></div>;
  if (error) return <div className="admin-applications-error"><p>{error}</p><button onClick={fetchApplications}>Retry</button></div>;

  return (
    <div className="admin-applications">
      <div className="applications-header">
        <h2>Charity Applications</h2>
        <p>Review and manage organizations applying for charity status.</p>
      </div>

      {applications.length === 0 ? (
        <div className="applications-empty">
          <p>No pending charity applications at the moment.</p>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map(app => (
            <div key={app.applicationID} className="application-card">
              <div className="app-card-header">
                <div className="user-id">User ID: {app.userID.substring(0, 8)}...</div>
                <div className="status-badge pending">Pending</div>
              </div>
              
              <div className="app-content">
                <div className="content-group">
                  <label>Purpose / Mission</label>
                  <p>{app.purpose}</p>
                </div>
                <div className="content-group">
                  <label>Government ID / Registration</label>
                  <p>{app.govID}</p>
                </div>

                <div className="review-actions">
                  <div className="input-group">
                    <label>Organization Name (for approval)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Save the Children"
                      value={app.orgNameInput}
                      onChange={(e) => setApplications(prev => prev.map(a => 
                        a.applicationID === app.applicationID ? { ...a, orgNameInput: e.target.value } : a
                      ))}
                    />
                  </div>
                  
                  <div className="button-group">
                    <button 
                      className="reject-btn"
                      disabled={app.isReviewing}
                      onClick={() => handleReview(app.applicationID, 'rejected')}
                    >
                      Reject
                    </button>
                    <button 
                      className="approve-btn"
                      disabled={app.isReviewing || !app.orgNameInput?.trim()}
                      onClick={() => handleReview(app.applicationID, 'approved', app.orgNameInput)}
                    >
                      {app.isReviewing ? 'Processing...' : 'Approve Charity'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCharityApplications;
