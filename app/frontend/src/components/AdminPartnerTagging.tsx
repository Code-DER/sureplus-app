import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api/apis';
import type { CharityResponse } from '../api/types';
import './AdminPartnerTagging.css';

interface CharityWithUser extends CharityResponse {
  User?: {
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  isUpdating?: boolean;
}

const AdminPartnerTagging: React.FC = () => {
  const [charities, setCharities] = useState<CharityWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCharities();
      setCharities(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching charities:', err);
      setError('Failed to load charities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleTogglePartner = async (userId: string, currentStatus: boolean) => {
    try {
      setCharities(prev => prev.map(c => 
        c.userID === userId ? { ...c, isUpdating: true } : c
      ));

      await adminAPI.togglePartnerStatus(userId, !currentStatus);

      setCharities(prev => prev.map(c => 
        c.userID === userId ? { ...c, isPartner: !currentStatus, isUpdating: false } : c
      ));
    } catch (err) {
      console.error('Error toggling partner status:', err);
      alert('Failed to update partner status.');
      setCharities(prev => prev.map(c => 
        c.userID === userId ? { ...c, isUpdating: false } : c
      ));
    }
  };

  if (loading) return <div className="admin-applications-loading"><div className="spinner"></div><p>Loading charities...</p></div>;
  if (error) return <div className="admin-applications-error"><p>{error}</p><button onClick={fetchCharities}>Retry</button></div>;

  return (
    <div className="pt-layout">
      <div className="pt-list">
        <div className="applications-header" style={{ marginBottom: '24px' }}>
          <h2>Partner Management</h2>
          <p>Tag charities as partners to enable donations and special features.</p>
        </div>

        {charities.length === 0 ? (
          <div className="applications-empty">
            <p>No charities found.</p>
          </div>
        ) : (
          <div className="charities-management-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {charities.map(charity => (
              <div key={charity.userID} className="pt-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div className="charity-info">
                    <h3 className="pt-name" style={{ marginBottom: '4px' }}>{charity.organizationName}</h3>
                    <div className="pt-location">
                      <span>{charity.User?.firstName} {charity.User?.lastName} ({charity.User?.emailAddress})</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className={`pt-status-chip ${charity.isPartner ? 'pt-status-chip--verified' : 'pt-status-chip--community'}`}>
                      {charity.isPartner ? 'Verified Partner' : 'Standard Charity'}
                    </div>
                    
                    <button 
                      className={`pt-toggle ${charity.isPartner ? 'pt-toggle--on' : 'pt-toggle--off'}`}
                      onClick={() => handleTogglePartner(charity.userID, charity.isPartner)}
                      disabled={charity.isUpdating}
                      title={charity.isPartner ? 'Untag as Partner' : 'Tag as Partner'}
                    >
                      <div className="pt-toggle-knob"></div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPartnerTagging;
