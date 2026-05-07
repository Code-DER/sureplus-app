import { useState, useEffect } from 'react';
import { apiGet } from '../api/client';
import type { Charity } from '../types/charity';
import './CharitiesListView.css';

interface CharitiesListViewProps {
  onViewCharity: (userId: string) => void;
  onBecomeCharity: () => void;
}

export default function CharitiesListView({ onViewCharity, onBecomeCharity }: CharitiesListViewProps) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCharities() {
      try {
        const data = await apiGet<Charity[]>('/charities/list');
        setCharities(data);
      } catch (err) {
        console.error('Failed to fetch charities:', err);
        setError('Failed to load charities. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchCharities();
  }, []);

  if (loading) {
    return (
      <div className="charities-list-loading">
        <p>Loading charities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charities-list-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="charities-list-container">
      <div className="charities-list-header">
        <h1>Charity Organizations</h1>
        <button className="btn-become-charity" onClick={onBecomeCharity}>
          Become a Charity
        </button>
      </div>

      <div className="charities-grid">
        {charities.length === 0 ? (
          <p className="no-charities">No charities found.</p>
        ) : (
          charities.map((charity) => (
            <div key={charity.userID} className="charity-card">
              <div className="charity-card-info">
                <h3>{charity.organizationName}</h3>
                <p className="charity-description">
                  Tap to view their fundraising posts and help make an impact in the community.
                </p>
              </div>
              <button 
                className="btn-view-posts" 
                onClick={() => onViewCharity(charity.userID)}
              >
                View Posts
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
