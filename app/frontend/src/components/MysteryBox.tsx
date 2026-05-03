import React, { useState } from 'react';
import './MysteryBox.css';

interface MysteryBoxProps {
  onBack: () => void;
}

const CONTENT_CATEGORIES = [
  { id: 'bakery', label: 'Bakery', icon: (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M3 14h16c1.1 0 2-.9 2-2 0-.78-.45-1.44-1.1-1.76.07-.15.1-.32.1-.49 0-.83-.67-1.5-1.5-1.5-.16 0-.31.03-.45.08C17.73 6.35 16 5 14 5c-.78 0-1.5.22-2.12.6C11.34 4.63 10.22 4 9 4c-1.82 0-3.35 1.1-4.02 2.67C3.41 6.24 2 7.38 2 9c0 .55.45 1 1 1v2c0 1.1.9 2 2 2z" fill="currentColor"/></svg>
  )},
  { id: 'produce', label: 'Produce', icon: (
    <svg width="14" height="19" viewBox="0 0 14 19" fill="none"><path d="M7 0C4.24 0 2 2.24 2 5c0 2.05 1.23 3.81 3 4.58V18c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V9.58c1.77-.77 3-2.53 3-4.58C12 2.24 9.76 0 7 0z" fill="currentColor"/></svg>
  )},
  { id: 'deli', label: 'Deli', icon: (
    <svg width="15" height="20" viewBox="0 0 18 20" fill="none"><path d="M9 0C7.9 0 7 .9 7 2v1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-3V2c0-1.1-.9-2-2-2zm0 2h0v1H9V2zM6 8h6v2H6V8z" fill="currentColor"/></svg>
  )},
  { id: 'vegan', label: 'Vegan', icon: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M17.5 2.5c-1.5 0-6.5.5-9 3s-3.5 6-3.5 8.5c0 1 .5 3.5 3 3.5s4-1.5 5-3c1-1.5 1.5-3 2-5 .5-2 2-4.5 2.5-5.5.5-1 .5-1.5 0-1.5zM6 16c-.83 0-1.5-.5-1.5-1.5C4.5 13 5 11 6.5 9c-.5 2-1 4.5 0 5.5.5.5 1.5.5 2 .5-.5.5-1.5 1-2.5 1z" fill="currentColor"/></svg>
  )},
];

const SAFETY_NOTES = [
  { id: 'gluten', label: 'May contain Gluten', selected: true },
  { id: 'nut-free', label: 'Nut-Free Facility', selected: false },
  { id: 'dairy', label: 'Dairy Present', selected: true },
];

export default function MysteryBox({ onBack }: MysteryBoxProps) {
  const [boxName, setBoxName] = useState('');
  const [price, setPrice] = useState('5.99');
  const [quantity, setQuantity] = useState('10');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['bakery']);
  const [safetyNotes, setSafetyNotes] = useState(SAFETY_NOTES);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleSafetyNote = (id: string) => {
    setSafetyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, selected: !n.selected } : n))
    );
  };

  const totalValue = (parseFloat(price || '0') * parseInt(quantity || '0', 10)).toFixed(2);
  const co2Offset = (parseInt(quantity || '0', 10) * 2.54).toFixed(1);
  const sellerShare = (parseFloat(totalValue) * 0.75).toFixed(2);

  return (
    <div className="mb-page">
      {/* Header */}
      <div className="mb-header-section">
        <nav className="mb-breadcrumb">
          <button className="mb-breadcrumb-link" onClick={onBack}>Dashboard</button>
          <svg className="mb-breadcrumb-sep" width="5" height="8" viewBox="0 0 5 8" fill="none"><path d="M1 1l3 3-3 3" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="mb-breadcrumb-current">Mystery Box</span>
        </nav>
        <h1 className="mb-title">Mystery Box Setup</h1>
        <p className="mb-subtitle">
          Create high-impact surplus boxes to rescue food efficiently. Bundle your leftover stock into exciting, surprise offers for your community.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="mb-columns">
        {/* Left: Setup Form */}
        <div className="mb-left-col">
          {/* Box Configuration Card */}
          <div className="mb-card mb-box-config">
            <div className="mb-card-heading">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 1l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z" stroke="#0F5238" strokeWidth="1.5" strokeLinejoin="round"/><path d="M5 15l1.5 3 3 .5-2 2 .5 3-3-1.5L2 20.5l.5-3-2-2 3-.5L5 12z" stroke="#0F5238" strokeWidth="1.2" strokeLinejoin="round"/><path d="M17 13l1 2 2 .5-1.5 1.5.5 2-2-1-2 1 .5-2L14 15.5l2-.5 1-2z" stroke="#0F5238" strokeWidth="1" strokeLinejoin="round"/></svg>
              <span>Box Configuration</span>
            </div>

            <div className="mb-fields">
              <div className="mb-field">
                <label className="mb-field-label">Internal Box Name (e.g., Morning Pastry Bundle)</label>
                <input
                  className="mb-field-input"
                  type="text"
                  placeholder="Gourmet Mystery Selection"
                  value={boxName}
                  onChange={(e) => setBoxName(e.target.value)}
                />
              </div>
              <div className="mb-field-row">
                <div className="mb-field mb-field-half">
                  <label className="mb-field-label">Price Per Box (₱)</label>
                  <div className="mb-price-wrapper">
                    <span className="mb-currency">₱</span>
                    <input
                      className="mb-field-input mb-price-input"
                      type="text"
                      placeholder="5.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-field mb-field-half">
                  <label className="mb-field-label">Available Quantity</label>
                  <input
                    className="mb-field-input"
                    type="number"
                    placeholder="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Categories Card */}
          <div className="mb-card mb-categories-card">
            <h3 className="mb-section-title">Estimated Box Value & Contents</h3>
            <p className="mb-section-desc">
              Select the primary categories likely to be included in this batch.
            </p>
            <div className="mb-category-grid">
              {CONTENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`mb-category-tile ${selectedCategories.includes(cat.id) ? 'selected' : ''}`}
                  onClick={() => toggleCategory(cat.id)}
                >
                  <div className="mb-tile-icon">{cat.icon}</div>
                  <span className="mb-tile-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Safety & Dietary Notes Card */}
          <div className="mb-card mb-safety-card">
            <h3 className="mb-section-title">Safety & Dietary Notes</h3>
            <div className="mb-safety-chips">
              {safetyNotes.map((note) => (
                <button
                  key={note.id}
                  className={`mb-safety-chip ${note.selected ? 'selected' : ''}`}
                  onClick={() => toggleSafetyNote(note.id)}
                >
                  {note.label}
                </button>
              ))}
            </div>
            <button className="mb-add-note-btn">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 0v8M0 4h8" stroke="#404943" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span>Add Note</span>
            </button>
          </div>
        </div>

        {/* Right: Impact Sidebar */}
        <div className="mb-right-col">
          <div className="mb-impact-sidebar">
            {/* Impact Projection */}
            <div className="mb-impact-header">
              <h3 className="mb-impact-title">Impact Projection</h3>
              <p className="mb-impact-desc">
                Every Mystery Box sold prevents roughly 1.5kg of waste.
              </p>
            </div>

            {/* Summary Rows */}
            <div className="mb-summary-rows">
              <div className="mb-summary-row mb-summary-border">
                <span className="mb-summary-label">Total Value</span>
                <span className="mb-summary-value mb-summary-bold">₱{totalValue}</span>
              </div>
              <div className="mb-summary-row mb-summary-border">
                <span className="mb-summary-label">CO2 Offset (est.)</span>
                <span className="mb-summary-value mb-summary-highlight">{co2Offset} kg</span>
              </div>
              <div className="mb-summary-row">
                <span className="mb-summary-label">Seller Share</span>
                <span className="mb-summary-value">₱{sellerShare}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-sidebar-actions">
              <button className="mb-activate-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v6l4 2M8 15A7 7 0 108 1a7 7 0 000 14z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Activate Mystery Box
              </button>
              <button className="mb-draft-btn">Save as Draft</button>
            </div>

            {/* Safety Notice */}
            <div className="mb-notice">
              <div className="mb-notice-content">
                <svg className="mb-notice-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#FE6B00" strokeWidth="1.5"/><path d="M10 6v5M10 13.5v.5" stroke="#FE6B00" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <p className="mb-notice-text">
                  Box contents must be verified edible and safe before pickup. Ensure all packaging is sealed properly to maintain freshness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
