import React, { useState } from 'react';
import './EditListing.css';

interface EditListingProps {
  item: {
    id: number;
    name: string;
    category: string;
    rescuePrice: string;
    quantity: number;
  };
  onBack: () => void;
}

const ALLERGEN_OPTIONS = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'nuts', label: 'Nuts' },
  { id: 'soy', label: 'Soy' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'celery', label: 'Celery' },
  { id: 'mustard', label: 'Mustard' },
];

export default function EditListing({ item, onBack }: EditListingProps) {
  const [title, setTitle] = useState("Gojo's Pandesal & Pastry Bundle");
  const [description, setDescription] = useState(
    "Selection of fresh, daily-baked sourdough loaves and assorted pastries including croissants and danishes. Rescued from today's surplus production to ensure no delicious treat goes to waste."
  );
  const [category, setCategory] = useState('Bakery');
  const [quantity, setQuantity] = useState(item.quantity || 12);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(['gluten', 'eggs']);
  const [originalPrice] = useState('45.00');
  const [rescuePrice, setRescuePrice] = useState('18.50');
  const [pickupDate] = useState('Today, Oct 24');
  const [startTime] = useState('05:00 PM');
  const [endTime] = useState('08:00 PM');

  const toggleAllergen = (id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const savingsPercent = originalPrice && rescuePrice
    ? Math.round((1 - parseFloat(rescuePrice) / parseFloat(originalPrice)) * 100)
    : 0;

  return (
    <div className="el-page">
      {/* Header */}
      <div className="el-header">
        <div className="el-header-left">
          <button className="el-back-btn" onClick={onBack}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M8 5H2M2 5l3-3M2 5l3 3" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Inventory
          </button>
          <h1 className="el-title">Edit Listing</h1>
          <p className="el-subtitle">Refine your surplus listing to maximize rescue impact.</p>
        </div>
        <div className="el-header-right">
          <button className="el-btn-discard" onClick={onBack}>Discard Changes</button>
          <button className="el-btn-save">Save Updates</button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="el-columns">
        {/* Left Column */}
        <div className="el-left-col">
          {/* Item Details Card */}
          <div className="el-card el-item-details-card">
            <div className="el-card-heading">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="1" y="1" width="20" height="20" rx="4" stroke="#0F5238" strokeWidth="2"/><path d="M7 7h8M7 11h8M7 15h5" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span>Item Details</span>
            </div>

            <div className="el-fields">
              <div className="el-field">
                <label className="el-field-label">PRODUCT TITLE</label>
                <input
                  className="el-field-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="el-field">
                <label className="el-field-label">DESCRIPTION</label>
                <textarea
                  className="el-field-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="el-field-row">
                <div className="el-field el-field-half">
                  <label className="el-field-label">CATEGORY</label>
                  <div className="el-select-wrapper">
                    <select
                      className="el-field-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Bakery</option>
                      <option>Fruits & Vegetables</option>
                      <option>Dairy & Eggs</option>
                      <option>Meat & Seafood</option>
                      <option>Prepared Meals</option>
                    </select>
                    <svg className="el-select-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5l5 5 5-5" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                <div className="el-field el-field-half">
                  <label className="el-field-label">STATUS</label>
                  <div className="el-status-badge">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#002114"/></svg>
                    <span>Currently Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity & Impact Row */}
          <div className="el-qty-impact-row">
            <div className="el-card el-quantity-card">
              <h3 className="el-section-title">Quantity</h3>
              <div className="el-qty-control-box">
                <button
                  className="el-qty-btn"
                  onClick={() => setQuantity(Math.max(0, quantity - 1))}
                >
                  <svg width="14" height="2" viewBox="0 0 14 2" fill="none"><rect width="14" height="2" rx="1" fill="#0F5238"/></svg>
                </button>
                <div className="el-qty-display">
                  <span className="el-qty-number">{quantity}</span>
                  <span className="el-qty-label">Items Left</span>
                </div>
                <button
                  className="el-qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect y="6" width="14" height="2" rx="1" fill="#0F5238"/><rect x="6" width="2" height="14" rx="1" fill="#0F5238"/></svg>
                </button>
              </div>
            </div>

            <div className="el-card el-impact-card">
              <div className="el-impact-heading">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 1C4.36 1 1 4.36 1 8.5S4.36 16 8.5 16 16 12.64 16 8.5 12.64 1 8.5 1zm0 13.5c-3.58 0-6.5-2.92-6.5-6.5S4.92 2 8.5 2 15 4.92 15 8.5 12.08 14.5 8.5 14.5z" fill="#005050"/><path d="M8.5 5v4l3 1.5" stroke="#005050" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span>Impact</span>
              </div>
              <p className="el-impact-text">
                Rescuing this listing will save approximately <strong>4.2kg of CO2</strong> emissions.
              </p>
              <div className="el-impact-bar-bg">
                <div className="el-impact-bar-fill" style={{ width: '75%' }} />
              </div>
            </div>
          </div>

          {/* Allergen Information Card */}
          <div className="el-card el-allergen-card">
            <h3 className="el-section-title">Allergen Information</h3>
            <p className="el-allergen-hint">Select all allergens present in this food item.</p>
            <div className="el-allergen-chips">
              {ALLERGEN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`el-allergen-chip ${selectedAllergens.includes(opt.id) ? 'selected' : ''}`}
                  onClick={() => toggleAllergen(opt.id)}
                >
                  {selectedAllergens.includes(opt.id) && (
                    <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 3.5L3.5 6L9 1" stroke="#002114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="el-right-col">
          {/* Media Card */}
          <div className="el-card el-media-card">
            <div className="el-media-image">
              <div className="el-media-placeholder">
                <span style={{ fontSize: '80px' }}>🍞</span>
              </div>
              <div className="el-media-overlay">
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none"><path d="M1 14l5-5 4 4 4-6 5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Change Photo</span>
              </div>
            </div>
            <div className="el-pricing-section">
              <h4 className="el-pricing-title">Pricing Structure</h4>
              <div className="el-pricing-fields">
                <div className="el-pricing-row">
                  <span className="el-pricing-label">Original Price</span>
                  <span className="el-pricing-original">₱{originalPrice}</span>
                </div>
                <div className="el-pricing-rescue-row">
                  <span className="el-pricing-rescue-label">Sureplus Price</span>
                  <div className="el-pricing-rescue-input">
                    <span className="el-pricing-currency">₱</span>
                    <input
                      className="el-pricing-value-input"
                      type="text"
                      value={rescuePrice}
                      onChange={(e) => setRescuePrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="el-pricing-savings">
                  {savingsPercent}% SAVINGS FOR BUYER
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling Card */}
          <div className="el-card el-schedule-card">
            <div className="el-schedule-heading">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#0F5238" strokeWidth="1.5"/><path d="M10 5v5.5l3.5 2" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span>Pickup Window</span>
            </div>
            <div className="el-schedule-fields">
              <div className="el-field">
                <label className="el-field-label-sm">Pickup Date</label>
                <div className="el-schedule-date">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="#191C1A" strokeWidth="1.2"/><path d="M1 5h10M4 1v2M8 1v2" stroke="#191C1A" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span>{pickupDate}</span>
                </div>
              </div>
              <div className="el-schedule-times">
                <div className="el-field">
                  <label className="el-field-label-sm">Start</label>
                  <input className="el-time-input" type="text" defaultValue={startTime} readOnly />
                </div>
                <div className="el-field">
                  <label className="el-field-label-sm">End</label>
                  <input className="el-time-input" type="text" defaultValue={endTime} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Listing Health Card */}
          <div className="el-health-card">
            <h4 className="el-health-title">Listing Health</h4>
            <div className="el-health-bar-row">
              <div className="el-health-bar-bg">
                <div className="el-health-bar-fill" style={{ width: '90%' }} />
              </div>
              <span className="el-health-score">Excellent</span>
            </div>
            <p className="el-health-text">
              Your listing description and high-quality photo increase its rescue probability by 40%.
            </p>
            <button className="el-boost-btn">Boost Listing</button>
          </div>
        </div>
      </div>
    </div>
  );
}
