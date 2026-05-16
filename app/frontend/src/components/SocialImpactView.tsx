import React, { useEffect, useState } from 'react';
import type { SocialImpactSummary } from '../api/types';
import { socialImpactAPI } from '../api/apis';
import './SocialImpactView.css';

const SocialImpactView: React.FC = () => {
  const [summary, setSummary] = useState<SocialImpactSummary | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImpactData = async () => {
    try {
      const [summaryRes, historyRes] = await Promise.all([
        socialImpactAPI.getMyImpactSummary(),
        socialImpactAPI.getImpactHistory()
      ]);
      setSummary(summaryRes.data);
      setHistory(historyRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching impact data:', err);
      setError('Failed to load your impact data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpactData();
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
        <button onClick={() => { setLoading(true); fetchImpactData(); }}>Retry</button>
      </div>
    );
  }

  const hasImpact = summary && (summary.purchaseCount > 0 || summary.donationCount > 0);

  const badges = [
    { id: 'first', label: 'First Rescue', icon: '🌱', description: 'Made your first impact', achieved: summary && (summary.purchaseCount > 0 || summary.donationCount > 0) },
    { id: '10kg', label: '10kg Eco-Hero', icon: '🌍', description: 'Saved 10kg of food', achieved: summary && summary.totalRescuedKilos >= 10 },
    { id: '50kg', label: '50kg Guardian', icon: '🛡️', description: 'Saved 50kg of food', achieved: summary && summary.totalRescuedKilos >= 50 },
    { id: '100kg', label: 'Centurion', icon: '💯', description: 'Saved 100kg of food', achieved: summary && summary.totalRescuedKilos >= 100 },
  ];

  return (
    <div className="social-impact-view">
      <header className="impact-header">
        <h2>Your Environmental & Social Impact</h2>
        <p>Your contributions through purchases and donations make a real difference.</p>
      </header>

      {!hasImpact ? (
        <div className="impact-empty-state">
          <div className="empty-icon">🌱</div>
          <h3>Start your rescue journey</h3>
          <p>You haven't made any impact yet. Shop the marketplace or donate food to see your stats grow!</p>
          <div className="action-buttons">
            <button className="browse-btn" onClick={() => window.location.href = '/'}>Browse Listings</button>
          </div>
        </div>
      ) : (
        <div className="impact-content-layout">
          <div className="impact-main-column">
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
                <p className="stat-label">FOOD SAVED</p>
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
            </div>

            <div className="impact-history-section">
              <div className="section-header">
                <h3>Contribution Timeline</h3>
                <p>Your rescue history and donation events</p>
              </div>
              <div className="history-timeline">
                {history.length === 0 ? (
                  <p className="empty-history">No history records found.</p>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-type">{item.type === 'purchase' ? '🛒 Purchase' : '🥗 Donation'}</span>
                          <span className="timeline-date">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <h4 className="timeline-title">{item.description}</h4>
                        <div className="timeline-impact-details">
                          <span className="detail-pill">Saved {item.rescuedKilos.toFixed(1)}kg</span>
                          <span className="detail-pill">{item.carbonOffset.toFixed(1)}kg CO₂e</span>
                          <span className="detail-pill">{item.peopleFed} Meals</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="impact-sidebar">
            <div className="badges-section">
              <h4>Impact Badges</h4>
              <div className="badges-grid">
                {badges.map(badge => (
                  <div key={badge.id} className={`badge-card ${badge.achieved ? 'achieved' : 'locked'}`}>
                    <div className="badge-icon">{badge.achieved ? badge.icon : '🔒'}</div>
                    <div className="badge-info">
                      <span className="badge-label">{badge.label}</span>
                      <span className="badge-desc">{badge.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="impact-summary-card">
              <h4>Activity Summary</h4>
              <div className="summary-row-alt">
                <span>Rescues Completed</span>
                <strong>{summary.purchaseCount}</strong>
              </div>
              <div className="summary-row-alt">
                <span>Food Donations</span>
                <strong>{summary.donationCount}</strong>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default SocialImpactView;
