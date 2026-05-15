import { useState, useEffect, useRef } from 'react';

import './EditListing.css';
import { foodAPI, safetyAPI } from '../api/apis';
import type { FoodItem } from '../types/food';

interface Allergen {
  allergenID: string;
  name: string;
}

interface EditListingProps {
  item: FoodItem;
  onBack: () => void;
  onSaved?: () => void;
}

function getApiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string | { msg?: string }[] } } };
  const detail = e?.response?.data?.detail;
  if (!detail) return 'An unexpected error occurred.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg ?? '').join(', ');
  return 'An unexpected error occurred.';
}

export default function EditListing({ item, onBack, onSaved }: EditListingProps) {
  const [title, setTitle] = useState(item.foodName);
  const [description, setDescription] = useState(item.description ?? '');
  const [quantity, setQuantity] = useState(item.stockQuantity);
  const [price, setPrice] = useState(String(Number(item.price).toFixed(2)));
  const [expiryDate, setExpiryDate] = useState(item.expirationDate?.substring(0, 10) ?? '');
  const [pictureUrl, setPictureUrl] = useState(item.picture ?? '');
  const [picturePreview, setPicturePreview] = useState<string | null>(item.picture ?? null);
  const [selectedAllergenIds, setSelectedAllergenIds] = useState<string[]>(
    item.allergens.map((a) => a.allergenID)
  );

  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loadingAllergens, setLoadingAllergens] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    safetyAPI.listAllergens()
      .then((res) => setAllergens(res.data))
      .catch(() => setAllergens([]))
      .finally(() => setLoadingAllergens(false));
  }, []);

  const toggleAllergen = (id: string) => {
    setSelectedAllergenIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_BYTES = 5 * 1024 * 1024;

  const handleFileChange = async (file: File) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Image must be under 5 MB (your file is ${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPicturePreview(objectUrl);
    setIsUploadingImage(true);
    setError(null);
    try {
      const res = await foodAPI.uploadImage(file);
      setPictureUrl(res.data.url);
    } catch (err) {
      setError('Image upload failed: ' + getApiError(err));
      setPicturePreview(item.picture ?? null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) { setError('Food name is required.'); return; }
    if (!description.trim()) { setError('Description is required.'); return; }
    if (!pictureUrl) { setError('Please upload an image.'); return; }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) { setError('Enter a valid price.'); return; }

    setIsSaving(true);
    try {
      await foodAPI.update(item.foodID, {
        foodName: title.trim(),
        description: description.trim(),
        picture: pictureUrl,
        price: parsedPrice,
        stockQuantity: quantity,
        expirationDate: expiryDate || undefined,
        allergenIDs: selectedAllergenIds,
      });
      setSaved(true);
      setTimeout(() => {
        onSaved?.();
        onBack();
      }, 1000);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const originalPrice = Number(item.price).toFixed(2);
  const parsedRescue = parseFloat(price);
  const savingsPercent = !isNaN(parsedRescue) && parseFloat(originalPrice) > 0
    ? Math.round((1 - parsedRescue / parseFloat(originalPrice)) * 100)
    : 0;

  return (
    <div className="el-page">
      {/* Header */}
      <div className="el-header">
        <div className="el-header-left">
          <button className="el-back-btn" onClick={onBack}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M8 5H2M2 5l3-3M2 5l3 3" stroke="#66B018" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Inventory
          </button>
          <h1 className="el-title">Edit Listing</h1>
          <p className="el-subtitle">Refine your surplus listing to maximize rescue impact.</p>
        </div>
        <div className="el-header-right">
          <button className="el-btn-discard" onClick={onBack} disabled={isSaving}>Discard Changes</button>
          <button className="el-btn-save" onClick={handleSave} disabled={isSaving || isUploadingImage}>
            {isSaving ? 'Saving…' : saved ? 'Saved!' : 'Save Updates'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#B71C1C', fontSize: 14 }}>
          {error}
        </div>
      )}

      {saved && (
        <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#1B5E20', fontSize: 14 }}>
          Listing updated successfully!
        </div>
      )}

      {/* Two Column Layout */}
      <div className="el-columns">
        {/* Left Column */}
        <div className="el-left-col">
          {/* Item Details Card */}
          <div className="el-card el-item-details-card">
            <div className="el-card-heading">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="1" y="1" width="20" height="20" rx="4" stroke="#66B018" strokeWidth="2"/><path d="M7 7h8M7 11h8M7 15h5" stroke="#66B018" strokeWidth="1.5" strokeLinecap="round"/></svg>
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
                  <label className="el-field-label">EXPIRY DATE</label>
                  <input
                    className="el-field-input"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                <div className="el-field el-field-half">
                  <label className="el-field-label">STATUS</label>
                  <div className="el-status-badge">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" fill={item.stockQuantity > 0 ? '#002114' : '#BA1A1A'}/>
                    </svg>
                    <span>{item.stockQuantity > 0 ? 'Currently Active' : 'Out of Stock'}</span>
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
                  type="button"
                >
                  <svg width="14" height="2" viewBox="0 0 14 2" fill="none"><rect width="14" height="2" rx="1" fill="#66B018"/></svg>
                </button>
                <div className="el-qty-display">
                  <span className="el-qty-number">{quantity}</span>
                  <span className="el-qty-label">Items Left</span>
                </div>
                <button
                  className="el-qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                  type="button"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect y="6" width="14" height="2" rx="1" fill="#66B018"/><rect x="6" width="2" height="14" rx="1" fill="#66B018"/></svg>
                </button>
              </div>
            </div>

            <div className="el-card el-impact-card">
              <div className="el-impact-heading">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 1C4.36 1 1 4.36 1 8.5S4.36 16 8.5 16 16 12.64 16 8.5 12.64 1 8.5 1zm0 13.5c-3.58 0-6.5-2.92-6.5-6.5S4.92 2 8.5 2 15 4.92 15 8.5 12.08 14.5 8.5 14.5z" fill="#005050"/><path d="M8.5 5v4l3 1.5" stroke="#005050" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span>Impact</span>
              </div>
              <p className="el-impact-text">
                Rescuing this listing will save approximately <strong>{(quantity * 0.35).toFixed(1)}kg of CO2</strong> emissions.
              </p>
              <div className="el-impact-bar-bg">
                <div className="el-impact-bar-fill" style={{ width: `${Math.min(quantity * 5, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Allergen Information Card */}
          <div className="el-card el-allergen-card">
            <h3 className="el-section-title">Allergen Information</h3>
            <p className="el-allergen-hint">Select all allergens present in this food item.</p>
            {loadingAllergens ? (
              <p style={{ fontSize: 13, color: '#707973' }}>Loading allergens…</p>
            ) : (
              <div className="el-allergen-chips">
                {allergens.map((a) => (
                  <button
                    key={a.allergenID}
                    className={`el-allergen-chip ${selectedAllergenIds.includes(a.allergenID) ? 'selected' : ''}`}
                    onClick={() => toggleAllergen(a.allergenID)}
                    type="button"
                  >
                    {selectedAllergenIds.includes(a.allergenID) && (
                      <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 3.5L3.5 6L9 1" stroke="#002114" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                    <span>{a.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="el-right-col">
          {/* Media Card */}
          <div className="el-card el-media-card">
            <div
              className="el-media-image"
              onClick={() => !isUploadingImage && fileInputRef.current?.click()}
              style={{ cursor: isUploadingImage ? 'wait' : 'pointer' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
              />
              {picturePreview ? (
                <img
                  src={picturePreview}
                  alt="Product"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                />
              ) : (
                <div className="el-media-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              )}
              <div className="el-media-overlay">
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none"><path d="M1 14l5-5 4 4 4-6 5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>{isUploadingImage ? 'Uploading…' : 'Change Photo'}</span>
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
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                {savingsPercent > 0 && (
                  <div className="el-pricing-savings">
                    {savingsPercent}% SAVINGS FOR BUYER
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Listing Health Card */}
          <div className="el-health-card">
            <h4 className="el-health-title">Listing Health</h4>
            <div className="el-health-bar-row">
              <div className="el-health-bar-bg">
                <div className="el-health-bar-fill" style={{ width: description.length > 50 && pictureUrl ? '90%' : description.length > 20 ? '60%' : '30%' }} />
              </div>
              <span className="el-health-score">
                {description.length > 50 && pictureUrl ? 'Excellent' : description.length > 20 ? 'Good' : 'Fair'}
              </span>
            </div>
            <p className="el-health-text">
              A complete description and a high-quality photo increase rescue probability by 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
