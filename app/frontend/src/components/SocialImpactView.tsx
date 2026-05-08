import React, { useEffect, useState } from 'react';
import type { SocialImpactSummary } from '../api/types';
import { socialImpactAPI } from '../api/apis';
import './SocialImpactView.css';

const SocialImpactView: React.FC = () => {
  const [summary, setSummary] = useState<SocialImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImpactSummary = async () => {
    try {
      const response = await socialImpactAPI.getMyImpactSummary();
      setSummary(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching impact summary:', err);
      setError('Failed to load your impact data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchImpactSummary();
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="impact-loading">
        <div className="spinner"></div>
        <p>Calculating your positive impact...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="impact-error">
        <p>{error}</p>
        <button onClick={() => { setLoading(true); fetchImpactSummary(); }}>Retry</button>
      </div>
    );
  }

  const hasImpact = summary && summary.purchaseCount > 0;

  return (
    <div className="social-impact-view">
      <header className="impact-header">
        <h2>Your Environmental & Social Impact</h2>
        <p>Every purchase you make on SurePlus contributes to a more sustainable world.</p>
      </header>

      {!hasImpact ? (
        <div className="impact-empty-state">
          <div className="empty-icon">🌱</div>
          <h3>Start your rescue journey</h3>
          <p>You haven't made any purchases yet. Make your first purchase to start tracking your impact on the environment and the community!</p>
          <button className="browse-btn" onClick={() => window.location.href = '/'}>Browse Listings</button>
        </div>
      ) : (
        <div className="impact-stats-grid">
          <div className="admin-stat-card dark">
            <div className="stat-header">
              <span className="stat-icon-wrapper dark-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                </svg>
              </span>
              <span className="stat-badge highlight">🌍 Eco-Hero</span>
            </div>
            <p className="stat-label">FOOD RESCUED</p>
            <h3 className="stat-value">{summary.totalRescuedKilos.toFixed(1)} kg</h3>
          </div>

          <div className="admin-stat-card">
            <div className="stat-header">
              <span className="stat-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707973" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </span>
            </div>
            <p className="stat-label">CARBON OFFSET</p>
            <h3 className="stat-value">{summary.totalCarbonOffset.toFixed(1)} kg CO₂e</h3>
          </div>

          <div className="admin-stat-card">
            <div className="stat-header">
              <span className="stat-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707973" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                </svg>
              </span>
            </div>
            <p className="stat-label">PEOPLE FED</p>
            <h3 className="stat-value">{summary.totalPeopleFed} Meals</h3>
          </div>

          <div className="admin-stat-card">
            <div className="stat-header">
              <span className="stat-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707973" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </span>
            </div>
            <p className="stat-label">TOTAL RESCUES</p>
            <h3 className="stat-value">{summary.purchaseCount}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialImpactView;
