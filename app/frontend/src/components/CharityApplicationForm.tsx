import { useState, useEffect } from 'react';
import { apiPost, apiGet } from '../api/client';
import type { CharityApplication } from '../types/charity';
import './CharityApplicationForm.css';

interface CharityApplicationFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export default function CharityApplicationForm({ onBack, onSuccess }: CharityApplicationFormProps) {
  const [purpose, setPurpose] = useState('');
  const [govID, setGovID] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingApplication, setExistingApplication] = useState<CharityApplication | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const applications = await apiGet<CharityApplication[]>('/charity-applications/mine');
        if (applications && applications.length > 0) {
          // Sort by newest if there are multiple (though usually there's only one active)
          setExistingApplication(applications[applications.length - 1]);
        }
      } catch (err) {
        console.error('Failed to fetch application status:', err);
      } finally {
        setCheckingStatus(false);
      }
    }
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !govID.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiPost('/charity-applications/', { purpose, govID });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Application submission failed:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="application-form-loading">
        <div className="spinner"></div>
        <p>Checking application status...</p>
      </div>
    );
  }

  if (existingApplication && existingApplication.status === 'approved') {
    return (
      <div className="application-status-container">
        <div className="status-card approved">
          <div className="status-icon">✓</div>
          <h2>Already a Charity</h2>
          <p>Your application has already been approved. You have full access to charity features.</p>
          <button className="btn-back-home" onClick={onBack}>Back to Charities</button>
        </div>
      </div>
    );
  }

  if (existingApplication && existingApplication.status === 'pending') {
    return (
      <div className="application-status-container">
        <div className="status-card pending">
          <div className="status-icon">⏳</div>
          <h2>Application Under Review</h2>
          <p>We've received your application. Our team is currently reviewing your details. We'll notify you once a decision is made.</p>
          <div className="application-summary">
            <p><strong>Purpose:</strong> {existingApplication.purpose}</p>
            <p><strong>Gov ID:</strong> {existingApplication.govID}</p>
          </div>
          <button className="btn-back-home" onClick={onBack}>Back to Charities</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="application-status-container">
        <div className="status-card success">
          <div className="status-icon">✓</div>
          <h2>Application Submitted!</h2>
          <p>Thank you for applying to become a charity partner. Your application is now under review.</p>
          <button className="btn-back-home" onClick={onBack}>Back to Charities</button>
        </div>
      </div>
    );
  }

  return (
    <div className="charity-application-container">
      <div className="form-header">
        <button className="btn-back-link" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1>Become a Charity Partner</h1>
        <p>Help us expand our reach and make a bigger impact in the community.</p>
      </div>

      {existingApplication && existingApplication.status === 'rejected' && (
        <div className="rejection-notice">
          <p><strong>Notice:</strong> Your previous application was not approved. You may submit a new application with updated information.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="application-form">
        <div className="input-group">
          <label htmlFor="purpose">Organization Purpose & Mission</label>
          <textarea
            id="purpose"
            placeholder="Tell us about your organization and how you plan to use rescued food..."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            rows={5}
          />
          <span className="input-hint">Explain your core mission and the community you serve.</span>
        </div>

        <div className="input-group">
          <label htmlFor="govID">Government ID / Registration Number</label>
          <input
            id="govID"
            type="text"
            placeholder="e.g. SEC-12345678"
            value={govID}
            onChange={(e) => setGovID(e.target.value)}
            required
          />
          <span className="input-hint">Provide your official registration reference for verification.</span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-submit-application" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
