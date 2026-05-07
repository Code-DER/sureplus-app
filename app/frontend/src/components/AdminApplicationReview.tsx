import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../api/client';
import type { CharityApplication } from '../types/charity';
import './AdminApplicationReview.css';

export default function AdminApplicationReview() {
  const [applications, setApplications] = useState<CharityApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    async function fetchPending() {
      try {
        const data = await apiGet<CharityApplication[]>('/charity-applications/pending');
        setApplications(data);
      } catch (err) {
        console.error('Failed to fetch pending applications:', err);
        setError('Failed to load pending applications.');
      } finally {
        setLoading(false);
      }
    }
    fetchPending();
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    if (status === 'approved' && approvingId !== id) {
      setApprovingId(id);
      setOrgName('');
      return;
    }

    setProcessingId(id);
    try {
      await apiPut(`/charity-applications/${id}/review`, {
        status,
        organizationName: status === 'approved' ? orgName : undefined
      });
      
      setApplications(prev => prev.filter(app => app.applicationID !== id));
      setApprovingId(null);
    } catch (err) {
      console.error('Review action failed:', err);
      setError('Failed to process the review. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-review-loading">
        <div className="spinner"></div>
        <p>Loading pending applications...</p>
      </div>
    );
  }

  if (error) {
    return <div className="admin-review-error"><p>{error}</p></div>;
  }

  return (
    <div className="admin-review-container">
      <header className="admin-review-header">
        <h1>Charity Application Review</h1>
        <p>Review and verify organizations applying for charity status.</p>
      </header>

      <div className="applications-list">
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>All Caught Up!</h3>
            <p>There are no pending charity applications to review.</p>
          </div>
        ) : (
          applications.map(app => (
            <div key={app.applicationID} className={`application-review-card ${processingId === app.applicationID ? 'processing' : ''}`}>
              <div className="card-header">
                <div className="applicant-id">
                  <span className="label">Applicant User ID:</span>
                  <span className="value">{app.userID}</span>
                </div>
                <span className="status-badge pending">Pending</span>
              </div>
              
              <div className="card-body">
                <div className="detail-group">
                  <label>Purpose & Mission</label>
                  <p className="purpose-text">{app.purpose}</p>
                </div>
                <div className="detail-group">
                  <label>Government ID / Registration</label>
                  <code className="gov-id">{app.govID}</code>
                </div>
              </div>

              <div className="card-footer">
                {approvingId === app.applicationID ? (
                  <div className="approval-form">
                    <div className="input-group">
                      <label>Confirm Organization Name</label>
                      <input 
                        type="text" 
                        value={orgName} 
                        onChange={e => setOrgName(e.target.value)} 
                        placeholder="e.g. Red Cross Davao"
                        autoFocus
                      />
                    </div>
                    <div className="approval-actions">
                      <button 
                        className="btn-confirm-approve" 
                        onClick={() => handleReview(app.applicationID, 'approved')}
                        disabled={!orgName.trim() || !!processingId}
                      >
                        Confirm Approval
                      </button>
                      <button 
                        className="btn-cancel-approve" 
                        onClick={() => setApprovingId(null)}
                        disabled={!!processingId}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      className="btn-approve" 
                      onClick={() => handleReview(app.applicationID, 'approved')}
                      disabled={!!processingId}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn-reject" 
                      onClick={() => handleReview(app.applicationID, 'rejected')}
                      disabled={!!processingId}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
