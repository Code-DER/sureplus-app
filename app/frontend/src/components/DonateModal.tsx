import React, { useEffect, useState } from 'react';
import type { CharityPost } from '../api/types';
import type { FoodItem } from '../types/food';
import { charityPostAPI, foodAPI, socialImpactAPI } from '../api/apis';
import OrderSuccessModal, { type ImpactStats } from './OrderSuccessModal';
import './DonateModal.css';

interface DonateModalProps {
  post: CharityPost;
  onClose: () => void;
  onSuccess: (updatedPost: CharityPost) => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ post: initialPost, onClose, onSuccess }) => {
  const [post, setPost] = useState<CharityPost>(initialPost);
  const [activeTab, setActiveTab] = useState<'money' | 'food'>(
    'food' // Money donations disabled as per spec, default to food
  );
  
  // Steps: 'form' -> 'confirm'
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  // Money donation state (kept for future but disabled in UI)
  const [amount, setAmount] = useState<string>('');
  
  // Food donation state
  const [availableFood, setAvailableFood] = useState<FoodItem[]>([]);
  const [selectedFoodID, setSelectedFoodID] = useState<string | null>(null);
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
        const response = await foodAPI.list({ edible_only: true });
        // Filter to only items with stock
        const food = response.data.filter((f: FoodItem) => f.stockQuantity > 0);
        // Sort by expiry date (soonest first)
        food.sort((a, b) => {
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        });
        setAvailableFood(food);
      } catch (err) {
        console.error('Error fetching food items:', err);
        setError('Failed to load available food items.');
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

    if (activeTab === 'money') {
      // Money donations are currently disabled in UI
      return;
    } else {
      if (!selectedFoodID) {
        setError('Please select a food item to donate.');
        return;
      }

      setLoading(true);
      try {
        const response = await charityPostAPI.donateToPost(post.charityID, {
          donationType: 'food',
          foodID: selectedFoodID,
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
        setStep('form'); // Go back to form on error
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedFood = availableFood.find(f => f.foodID === selectedFoodID);
  const weightImpact = selectedFood ? selectedFood.weightKg * quantity : 0;
  
  // Money impact estimate: ₱50 = 1kg food saved (placeholder ratio)
  const moneyAmountNum = parseFloat(amount) || 0;
  const moneyImpactKg = moneyAmountNum / 50;

  const moneyProgress = post.amountNeeded && post.amountNeeded > 0 
    ? Math.min((post.currentAmount / post.amountNeeded) * 100, 100) 
    : 0;
  
  const foodProgress = post.foodGoalKg && post.foodGoalKg > 0
    ? Math.min((post.currentFoodKg / post.foodGoalKg) * 100, 100)
    : 0;

  if (showSuccess && impactStats) {
    return <OrderSuccessModal stats={impactStats} onClose={onClose} title="Donation Successful!" />;
  }

  const renderFormStep = () => (
    <>
      <div className="current-progress-info">
        {activeTab === 'money' ? (
          <>
            <div className="progress-stats">
              <span>₱{post.currentAmount.toLocaleString()} raised</span>
              {post.amountNeeded !== null && <span>Goal: ₱{post.amountNeeded.toLocaleString()}</span>}
            </div>
            {post.amountNeeded !== null && (
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${moneyProgress}%` }}></div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="progress-stats">
              <span>{post.currentFoodKg.toLocaleString()}kg food raised</span>
              {post.foodGoalKg !== null && <span>Goal: {post.foodGoalKg.toLocaleString()}kg</span>}
            </div>
            {post.foodGoalKg !== null && (
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${foodProgress}%` }}></div>
              </div>
            )}
          </>
        )}
      </div>

      {activeTab === 'money' ? (
        <div className="money-donation-form">
          <p className="donation-instruction" style={{ color: '#BA1A1A', fontWeight: 600 }}>
            Money donations are currently disabled per project scope. 
            Please use the "Donate Food" tab to contribute.
          </p>
          <div className="form-group" style={{ opacity: 0.5 }}>
            <label>Donation Amount (₱)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              disabled
            />
          </div>
          <div className="impact-preview-money">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Every ₱50 helps rescue approximately 1kg of food.</span>
            {moneyAmountNum > 0 && (
              <div className="estimate-highlight">
                Estimated impact: <strong>{moneyImpactKg.toFixed(1)}kg</strong> rescued
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="food-donation-form">
          {post.description && (
            <div className="charity-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Charity Needs: {post.description.substring(0, 100)}{post.description.length > 100 ? '...' : ''}</span>
            </div>
          )}
          <p className="donation-instruction">
            Select a food item to donate. <em>Urgent rescues (soonest expiry) are shown first.</em>
          </p>
          
          {foodLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Loading available food...</p>
            </div>
          ) : availableFood.length === 0 ? (
            <p className="error-message">No food items available for donation at the moment.</p>
          ) : (
            <>
              <div className="food-browser">
                {availableFood.map(food => (
                  <div 
                    key={food.foodID}
                    className={`food-item-option ${selectedFoodID === food.foodID ? 'selected' : ''}`}
                    onClick={() => setSelectedFoodID(food.foodID)}
                  >
                    <div className="food-item-info">
                      <span className="food-item-name">{food.foodName}</span>
                      <span className="food-item-meta">
                        {food.weightKg}kg • ₱{food.price}/unit • Exp: {food.expirationDate ? new Date(food.expirationDate).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="seller-name">Seller: {food.Seller?.companyName || 'Unknown'}</span>
                    </div>
                    <span className={`food-item-stock ${food.stockQuantity < 5 ? 'low' : ''}`}>
                      {food.stockQuantity} left
                    </span>
                  </div>
                ))}
              </div>

              {selectedFoodID && (
                <div className="quantity-picker">
                  <label htmlFor="quantity">Quantity:</label>
                  <input 
                    id="quantity"
                    type="number"
                    className="quantity-input"
                    min="1"
                    max={selectedFood?.stockQuantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                  <div className="impact-preview">
                    Total Contribution: <strong>{weightImpact.toFixed(2)}kg</strong>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {error && <div className="error-message" style={{ marginTop: '16px' }}>{error}</div>}

      <div className="modal-footer" style={{ margin: '24px -24px -24px', borderRadius: '0 0 16px 16px' }}>
        <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button 
          type="button" 
          className="confirm-btn" 
          disabled={loading || (activeTab === 'food' && !selectedFoodID)}
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
        <div className="summary-row">
          <span className="summary-label">Donation Type</span>
          <span className="summary-value">{activeTab === 'money' ? '💰 Money' : '🥗 Food'}</span>
        </div>
        {activeTab === 'food' && selectedFood && (
          <>
            <div className="summary-row">
              <span className="summary-label">Item</span>
              <span className="summary-value">{selectedFood.foodName}</span>
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
        By confirming, you agree to donate these items to the charity. This action cannot be undone.
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
          <>


            <div className="modal-body">
              {step === 'form' ? renderFormStep() : renderConfirmStep()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonateModal;
