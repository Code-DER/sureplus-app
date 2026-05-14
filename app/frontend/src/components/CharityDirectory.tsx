import React, { useEffect, useState } from 'react';
import type { CharityResponse } from '../api/types';
import { charityAPI } from '../api/apis';
import './CharityDirectory.css';

interface CharityDirectoryProps {
  onViewProfile: (userId: string) => void;
}

const CharityDirectory: React.FC<CharityDirectoryProps> = ({ onViewProfile }) => {
  const [charities, setCharities] = useState<CharityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCharities = async () => {
    try {
      const response = await charityAPI.getAllCharities();
      setCharities(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching charities:', err);
      setError('Failed to load charities directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const filteredCharities = charities.filter(charity => 
    charity.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="charity-directory-loading">
        <div className="spinner"></div>
        <p>Loading charities directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charity-directory-error">
        <p>{error}</p>
        <button onClick={() => {
          setLoading(true);
          fetchCharities();
        }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="charity-directory">
      <div className="directory-header">
        <div className="search-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search organizations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCharities.length === 0 ? (
        <div className="directory-empty">
          <p>No organizations found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="charity-list">
          {filteredCharities.map(charity => (
            <div key={charity.userID} className="charity-list-item">
              <div className="charity-logo-small">
                {charity.organizationName[0]}
              </div>
              <div className="charity-item-info">
                <h3>{charity.organizationName}</h3>
              </div>
              <button 
                className="view-btn" 
                onClick={() => onViewProfile(charity.userID)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharityDirectory;
