import React, { useEffect, useState } from 'react';
import type { CharityPost } from '../api/types';
import type { FoodItem } from '../types/food';
import { charityPostAPI, foodAPI } from '../api/apis';
import './DonateModal.css';

interface DonateModalProps {
  post: CharityPost;
  onClose: () => void;
  onSuccess: (updatedPost: CharityPost) => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ post: initialPost, onClose, onSuccess }) => {
  const [post, setPost] = useState<CharityPost>(initialPost);
  const [activeTab, setActiveTab] = useState<'money' | 'food'>(
    initialPost.donationMode === 'food' ? 'food' : 'money'
  );
  
  // Money donation state
  const [amount, setAmount] = useState<string>('');
  
  // Food donation state
  const [availableFood, setAvailableFood] = useState<FoodItem[]>([]);
  const [selectedFoodID, setSelectedFoodID] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [foodLoading, setFoodLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      if (initialPost.donationMode === 'money') return;
      
      setFoodLoading(true);
      try {
        const response = await foodAPI.list({ edible_only: true });
        // Filter to only items with stock
        setAvailableFood(response.data.filter((f: FoodItem) => f.stockQuantity > 0));
      } catch (err) {
        console.error('Error fetching food items:', err);
        setError('Failed to load available food items.');
      } finally {
        setFoodLoading(false);
      }
    };

    fetchLatestPost();
    fetchFoodItems();
  }, [initialPost.charityID, initialPost.donationMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'money') {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid donation amount.');
        return;
      }

      setLoading(true);
      try {
        const response = await charityPostAPI.donateToPost(post.charityID, {
          donationType: 'money',
          amount: numAmount
        });
        onSuccess(response.data);
        onClose();
      } catch (err) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || 'Failed to process money donation.');
      } finally {
        setLoading(false);
      }
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
        onSuccess(response.data);
        onClose();
      } catch (err) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || 'Failed to process food donation.');
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedFood = availableFood.find(f => f.foodID === selectedFoodID);
  const weightImpact = selectedFood ? selectedFood.weightKg * quantity : 0;

  const moneyProgress = post.amountNeeded && post.amountNeeded > 0 
    ? Math.min((post.currentAmount / post.amountNeeded) * 100, 100) 
    : 0;
  
  const foodProgress = post.foodGoalKg && post.foodGoalKg > 0
    ? Math.min((post.currentFoodKg / post.foodGoalKg) * 100, 100)
    : 0;

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
            {post.donationMode === 'both' && (
              <div className="modal-tabs">
                <button 
                  className={`modal-tab ${activeTab === 'money' ? 'active' : ''}`}
                  onClick={() => setActiveTab('money')}
                >
                  Donate Money
                </button>
                <button 
                  className={`modal-tab ${activeTab === 'food' ? 'active' : ''}`}
                  onClick={() => setActiveTab('food')}
                >
                  Donate Food
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
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
                    <p className="donation-instruction">
                      Enter the amount you wish to donate to help {post.title} reach its goal.
                    </p>
                    <div className="input-group">
                      <label htmlFor="amount">Donation Amount (₱)</label>
                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                ) : (
                  <div className="food-donation-form">
                    <p className="donation-instruction">
                      Select a food item from the marketplace to donate.
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
                                <span className="food-item-meta">{food.weightKg}kg • ₱{food.price}/unit</span>
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
                              Total Contribution: {weightImpact.toFixed(2)}kg
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {error && <div className="error-message">{error}</div>}
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="confirm-btn" 
                  disabled={loading || (activeTab === 'food' && !selectedFoodID)}
                >
                  {loading ? 'Processing...' : 'Confirm Donation'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DonateModal;
