import React, { useEffect, useState } from 'react';
import type { CharityPost } from '../api/types';
import { charityPostAPI, purchaseAPI, socialImpactAPI } from '../api/apis';
import OrderSuccessModal, { type ImpactStats } from './OrderSuccessModal';
import './DonateModal.css';

interface PurchasedFoodItem {
  purchaseID: string;
  foodID: string;
  foodName: string;
  description: string | null;
  picture: string | null;
  weightKg: number;
  expirationDate: string | null;
  purchasedQuantity: number;
  donatableQuantity: number;
  pricePaid: number;
}

interface DonateModalProps {
  post: CharityPost;
  onClose: () => void;
  onSuccess: (updatedPost: CharityPost) => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ post: initialPost, onClose, onSuccess }) => {
  const [post, setPost] = useState<CharityPost>(initialPost);
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  // Food donation state
  const [availableFood, setAvailableFood] = useState<PurchasedFoodItem[]>([]);
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null); // "purchaseID_foodID"
  const [quantity, setQuantity] = useState<number>(1);
  const [foodLoading, setFoodLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Success impact state
  const [showSuccess, setShowSuccess] = useState(false);
  const [impactStats, setImpactStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const response = await charityPostAPI.getPostById(initialPost.charityID);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching latest post data:', err);
      } finally {
        setFetching(false);
      }
    };

    const fetchFoodItems = async () => {
      setFoodLoading(true);
      try {
        const response = await purchaseAPI.getMyFood();
        setAvailableFood(response.data);
      } catch (err) {
        console.error('Error fetching food items:', err);
        setError('Failed to load your purchased food items.');
      } finally {
        setFoodLoading(false);
      }
    };

    fetchLatestPost();
    fetchFoodItems();
  }, [initialPost.charityID]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!selectedItemKey) {
      setError('Please select a food item to donate.');
      return;
    }

    const selectedItem = availableFood.find(f => `${f.purchaseID}_${f.foodID}` === selectedItemKey);
    if (!selectedItem) return;

    setLoading(true);
    try {
      const response = await charityPostAPI.donateToPost(post.charityID, {
        donationType: 'food',
        foodID: selectedItem.foodID,
        purchaseID: selectedItem.purchaseID,
        quantity: quantity
      });
      
      const donationID = response.data.donationID;
      if (donationID) {
        try {
          const impactResp = await socialImpactAPI.getImpactByDonation(donationID);
          const impact = impactResp.data;
          
          setImpactStats({
            foodSaved: Math.round(impact.rescuedKilos * 10) / 10,
            carbonReduced: Math.round(impact.carbonOffset * 10) / 10,
            peopleFed: impact.peopleFed,
            pointsEarned: 0,
          });
          setShowSuccess(true);
          onSuccess(response.data.post);
        } catch (impactErr) {
          console.error('Failed to fetch impact:', impactErr);
          onSuccess(response.data.post);
          onClose();
        }
      } else {
        onSuccess(response.data.post);
        onClose();
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to process food donation.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = availableFood.find(f => `${f.purchaseID}_${f.foodID}` === selectedItemKey);
  const weightImpact = selectedItem ? selectedItem.weightKg * quantity : 0;

  const foodProgress = post.foodGoalKg && post.foodGoalKg > 0
    ? Math.min((post.currentFoodKg / post.foodGoalKg) * 100, 100)
    : 0;

  if (showSuccess && impactStats) {
    return <OrderSuccessModal stats={impactStats} onClose={onClose} title="Donation Successful!" />;
  }

  const renderFormStep = () => (
    <>
      <div className="current-progress-info">
        <div className="progress-stats">
          <span>{post.currentFoodKg.toLocaleString()}kg food raised</span>
          {post.foodGoalKg !== null && <span>Goal: {post.foodGoalKg.toLocaleString()}kg</span>}
        </div>
        {post.foodGoalKg !== null && (
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${foodProgress}%` }}></div>
          </div>
        )}
      </div>

      <div className="food-donation-form">
        <p className="donation-instruction">
          Select food from your past purchases to donate. 
          <em> Soonest to expire items are shown first.</em>
        </p>
        
        {foodLoading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading your food items...</p>
          </div>
        ) : availableFood.length === 0 ? (
          <div className="empty-state-notice">
            <p>You don't have any purchased food items available to donate.</p>
            <p className="sub-note">Go to the Marketplace to rescue some food first!</p>
          </div>
        ) : (
          <>
            <div className="food-browser">
              {availableFood.map(food => {
                const key = `${food.purchaseID}_${food.foodID}`;
                return (
                  <div 
                    key={key}
                    className={`food-item-option ${selectedItemKey === key ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedItemKey(key);
                      setQuantity(1);
                    }}
                  >
                    <div className="food-item-info">
                      <span className="food-item-name">{food.foodName}</span>
                      <span className="food-item-meta">
                        {food.weightKg}kg • Exp: {food.expirationDate ? new Date(food.expirationDate).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="purchase-label">From my purchase</span>
                    </div>
                    <span className={`food-item-stock ${food.donatableQuantity < 2 ? 'low' : ''}`}>
                      {food.donatableQuantity} available
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedItem && (
              <div className="quantity-picker">
                <label htmlFor="quantity">Quantity to Donate:</label>
                <input 
                  id="quantity"
                  type="number"
                  className="quantity-input"
                  min="1"
                  max={selectedItem.donatableQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, selectedItem.donatableQuantity))}
                />
                <div className="impact-preview">
                  Total Contribution: <strong>{weightImpact.toFixed(2)}kg</strong>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {error && <div className="error-message" style={{ marginTop: '16px' }}>{error}</div>}

      <div className="modal-footer" style={{ margin: '24px -24px -24px', borderRadius: '0 0 16px 16px' }}>
        <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button 
          type="button" 
          className="confirm-btn" 
          disabled={loading || !selectedItemKey}
          onClick={() => setStep('confirm')}
        >
          Review Donation
        </button>
      </div>
    </>
  );

  const renderConfirmStep = () => (
    <div className="confirmation-step">
      <h3>Confirm Your Donation</h3>
      <div className="confirmation-summary">
        <div className="summary-row">
          <span className="summary-label">Campaign</span>
          <span className="summary-value">{post.title}</span>
        </div>
        {selectedItem && (
          <>
            <div className="summary-row">
              <span className="summary-label">Item</span>
              <span className="summary-value">{selectedItem.foodName}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Quantity</span>
              <span className="summary-value">{quantity} units</span>
            </div>
            <div className="summary-row highlight">
              <span className="summary-label">Total Impact</span>
              <span className="summary-value">{weightImpact.toFixed(2)}kg food rescued</span>
            </div>
          </>
        )}
      </div>

      <p className="confirmation-note">
        By confirming, you agree to donate these items from your inventory to the charity. 
        This action cannot be undone.
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="modal-footer" style={{ margin: '24px -24px -24px', borderRadius: '0 0 16px 16px' }}>
        <button type="button" className="cancel-btn" onClick={() => setStep('form')} disabled={loading}>
          Back
        </button>
        <button 
          type="button" 
          className="confirm-btn" 
          disabled={loading}
          onClick={() => handleSubmit()}
        >
          {loading ? 'Processing...' : 'Confirm & Donate'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="donate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Donate to {post.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {fetching ? (
          <div className="modal-body">
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Fetching latest campaign status...</p>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            {step === 'form' ? renderFormStep() : renderConfirmStep()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateModal;
