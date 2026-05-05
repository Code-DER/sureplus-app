import React, { useState } from 'react';
import './CreateNewListing.css';

const ALLERGEN_OPTIONS = [
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'contains-eggs', label: 'Contains Eggs', icon: '🥚' },
  { id: 'organic', label: 'Organic', icon: '🍃' },
  { id: 'nut-free', label: 'Nut-Free', icon: '🥜' },
  { id: 'halal', label: 'Halal', icon: '☪' },
  { id: 'contains-dairy', label: 'Contains Dairy', icon: '🧀' },
];

const CATEGORIES = [
  'Bakery & Grains',
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Beverages',
  'Snacks & Sweets',
  'Prepared Meals',
  'Other',
];

interface CreateNewListingProps {
  onBack: () => void;
}

export default function CreateNewListing({ onBack }: CreateNewListingProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Bakery & Grains');
  const [quantity, setQuantity] = useState(12);
  const [listingType, setListingType] = useState<'individual' | 'bundle'>('individual');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [price, setPrice] = useState('0.00');

  const toggleAllergen = (id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="cnl-page">
      {/* Header Section */}
      <div className="cnl-header-section">
        <nav className="cnl-breadcrumb">
          <button className="cnl-breadcrumb-link" onClick={onBack}>Dashboard</button>
          <svg className="cnl-breadcrumb-sep" width="5" height="8" viewBox="0 0 5 8" fill="none"><path d="M1 1l3 3-3 3" stroke="#707973" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="cnl-breadcrumb-current">Create New Listing</span>
        </nav>
        <h1 className="cnl-title">Rescue New Items</h1>
        <p className="cnl-subtitle">
          List your surplus food today. Every item listed is a step towards zero waste in our community.
        </p>
      </div>

      {/* Bento Grid Form */}
      <div className="cnl-bento-grid">
        {/* ===== Food Information Card ===== */}
        <div className="cnl-card cnl-food-info">
          <h2 className="cnl-card-title">Food Information</h2>
          <div className="cnl-fields">
            {/* Listing Title */}
            <div className="cnl-field">
              <label className="cnl-label">Listing Title</label>
              <input
                className="cnl-input"
                type="text"
                placeholder="e.g. Fresh Artisan Sourdough (Pandesal ni zoro) Batch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            {/* Description */}
            <div className="cnl-field">
              <label className="cnl-label">Description</label>
              <textarea
                className="cnl-textarea"
                placeholder="Describe the items, their condition, and why they are surplus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
            {/* Category + Date Row */}
            <div className="cnl-field-row">
              <div className="cnl-field cnl-field-half">
                <label className="cnl-label">Category</label>
                <div className="cnl-select-wrapper">
                  <select
                    className="cnl-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <svg className="cnl-select-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5l5 5 5-5" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <div className="cnl-field cnl-field-half">
                <label className="cnl-label">Best Before / Expiry</label>
                <input
                  className="cnl-input"
                  type="datetime-local"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== Media Upload Card ===== */}
        <div className="cnl-card cnl-media-upload">
          <div className="cnl-media-header">
            <div className="cnl-camera-icon-circle">
              <svg width="33" height="30" viewBox="0 0 24 22" fill="none">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="#0F5238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="#0F5238" strokeWidth="2"/>
                <path d="M18 3h2m-1-1v2" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="cnl-media-title">Add Photos</h3>
          </div>
          <p className="cnl-media-desc">
            Upload up to 5 clear photos of the food items to build buyer trust.
          </p>
          <div className="cnl-upload-zone">
            <div className="cnl-upload-dashed">
              <div className="cnl-upload-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#BFC9C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="cnl-upload-text">Drag & drop or click to upload</span>
                <span className="cnl-upload-hint">PNG, JPG up to 5MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Inventory Card ===== */}
        <div className="cnl-card cnl-inventory">
          <h3 className="cnl-card-subtitle">Inventory</h3>
          <div className="cnl-inventory-fields">
            {/* Quantity */}
            <div className="cnl-field">
              <label className="cnl-label cnl-label-with-pad">Total Quantity Available</label>
              <div className="cnl-quantity-control">
                <button
                  className="cnl-qty-btn cnl-qty-minus"
                  onClick={() => setQuantity(Math.max(0, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <svg width="14" height="2" viewBox="0 0 14 2" fill="none"><rect width="14" height="2" rx="1" fill="#0F5238"/></svg>
                </button>
                <span className="cnl-qty-value">{quantity}</span>
                <button
                  className="cnl-qty-btn cnl-qty-plus"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect y="6" width="14" height="2" rx="1" fill="white"/><rect x="6" width="2" height="14" rx="1" fill="white"/></svg>
                </button>
              </div>
              <span className="cnl-qty-unit">Units / Portions</span>
            </div>

            {/* Listing Type */}
            <div className="cnl-field">
              <label className="cnl-label">Listing Type</label>
              <div className="cnl-type-toggle">
                <button
                  className={`cnl-type-btn ${listingType === 'individual' ? 'active' : ''}`}
                  onClick={() => setListingType('individual')}
                >
                  Individual
                </button>
                <button
                  className={`cnl-type-btn ${listingType === 'bundle' ? 'active' : ''}`}
                  onClick={() => setListingType('bundle')}
                >
                  Bundle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Allergens & Dietary Card ===== */}
        <div className="cnl-card cnl-allergens">
          <h3 className="cnl-card-subtitle">Allergens & Dietary Information</h3>
          <p className="cnl-allergens-hint">Select all that apply to help buyers identify safe options.</p>
          <div className="cnl-chips">
            {ALLERGEN_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className={`cnl-chip ${selectedAllergens.includes(opt.id) ? 'selected' : ''}`}
                onClick={() => toggleAllergen(opt.id)}
              >
                <span className="cnl-chip-icon">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== Rescue Impact / Pricing ===== */}
        <div className="cnl-impact-bar">
          <div className="cnl-impact-info">
            <h3 className="cnl-impact-title">Rescue Impact</h3>
            <p className="cnl-impact-desc">
              By listing these {quantity} items, you are preventing approximately {(quantity * 0.35).toFixed(1)}kg of CO2
              emissions. Your store's impact score will increase by {Math.round(quantity * 1.25)} points.
            </p>
          </div>
          <div className="cnl-impact-price">
            <label className="cnl-price-label">Set Price (Optional)</label>
            <div className="cnl-price-input-wrapper">
              <span className="cnl-currency-symbol">₱</span>
              <input
                className="cnl-price-input"
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <span className="cnl-price-hint">LEAVE 0 FOR FREE DONATION</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="cnl-actions">
        <button className="cnl-btn-draft" onClick={onBack}>Save as Draft</button>
        <button className="cnl-btn-post">Post Surplus Food</button>
      </div>
    </div>
  );
}
