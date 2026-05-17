import { useState, useEffect, useRef } from 'react';

import './CreateNewListing.css';
import { foodAPI, safetyAPI } from '../api/apis';

interface Allergen {
  allergenID: string;
  name: string;
}

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
  onCreated?: () => void;
}

function getApiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string | { msg?: string }[] } } };
  const detail = e?.response?.data?.detail;
  if (!detail) return 'An unexpected error occurred.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg ?? '').join(', ');
  return 'An unexpected error occurred.';
}

export default function CreateNewListing({ onBack, onCreated }: CreateNewListingProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Bakery & Grains');
  const [quantity, setQuantity] = useState(12);
  const [listingType, setListingType] = useState<'individual' | 'bundle'>('individual');
  const [selectedAllergenIds, setSelectedAllergenIds] = useState<string[]>([]);
  const [price, setPrice] = useState('0.00');
  const [expiryDate, setExpiryDate] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loadingAllergens, setLoadingAllergens] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      setPicturePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) { setError('Food name is required.'); return; }
    if (!description.trim()) { setError('Description is required.'); return; }
    if (!pictureUrl) { setError('Please upload an image.'); return; }
    if (!expiryDate) { setError('Expiry date is required.'); return; }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) { setError('Enter a valid price (0 for free).'); return; }

    setIsSubmitting(true);
    try {
      await foodAPI.create({
        foodName: title.trim(),
        description: description.trim(),
        picture: pictureUrl,
        price: parsedPrice,
        stockQuantity: quantity,
        expirationDate: expiryDate.substring(0, 10),
        allergenIDs: selectedAllergenIds,
      });
      setSuccess(true);
      onCreated?.();
      setTimeout(() => onBack(), 1500);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
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

      {error && (
        <div style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#B71C1C', fontSize: 14 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#1B5E20', fontSize: 14 }}>
          Listing created successfully! Redirecting…
        </div>
      )}

      {/* Bento Grid Form */}
      <div className="cnl-bento-grid">
        {/* ===== Food Information Card ===== */}
        <div className="cnl-card cnl-food-info">
          <h2 className="cnl-card-title">Food Information</h2>
          <div className="cnl-fields">
            <div className="cnl-field">
              <label className="cnl-label">Listing Title *</label>
              <input
                className="cnl-input"
                type="text"
                placeholder="e.g. Fresh Artisan Sourdough Batch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="cnl-field">
              <label className="cnl-label">Description *</label>
              <textarea
                className="cnl-textarea"
                placeholder="Describe the items, their condition, and why they are surplus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
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
                <label className="cnl-label">Best Before / Expiry *</label>
                <input
                  className="cnl-input"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().substring(0, 10)}
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
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="#66B018" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="#66B018" strokeWidth="2"/>
                <path d="M18 3h2m-1-1v2" stroke="#66B018" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="cnl-media-title">Add Photo *</h3>
          </div>
          <p className="cnl-media-desc">
            Upload a clear photo of the food item to build buyer trust.
          </p>
          <div
            className="cnl-upload-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !isUploadingImage && fileInputRef.current?.click()}
            style={{ cursor: isUploadingImage ? 'wait' : 'pointer' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
            />
            <div className="cnl-upload-dashed">
              {picturePreview ? (
                <img
                  src={picturePreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                />
              ) : (
                <div className="cnl-upload-placeholder">
                  {isUploadingImage ? (
                    <span className="cnl-upload-text" style={{ color: '#66B018' }}>Uploading…</span>
                  ) : (
                    <>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#BFC9C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="cnl-upload-text">Drag & drop or click to upload</span>
                      <span className="cnl-upload-hint">JPEG, PNG, or WebP · max 5 MB</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {pictureUrl && !isUploadingImage && (
            <p style={{ fontSize: 12, color: '#66B018', marginTop: 6 }}>✓ Image uploaded</p>
          )}
        </div>

        {/* ===== Inventory Card ===== */}
        <div className="cnl-card cnl-inventory">
          <h3 className="cnl-card-subtitle">Inventory</h3>
          <div className="cnl-inventory-fields">
            <div className="cnl-field">
              <label className="cnl-label cnl-label-with-pad">Total Quantity Available</label>
              <div className="cnl-quantity-control">
                <button
                  className="cnl-qty-btn cnl-qty-minus"
                  onClick={() => setQuantity(Math.max(0, quantity - 1))}
                  aria-label="Decrease quantity"
                  type="button"
                >
                  <svg width="14" height="2" viewBox="0 0 14 2" fill="none"><rect width="14" height="2" rx="1" fill="#66B018"/></svg>
                </button>
                <span className="cnl-qty-value">{quantity}</span>
                <button
                  className="cnl-qty-btn cnl-qty-plus"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  type="button"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect y="6" width="14" height="2" rx="1" fill="white"/><rect x="6" width="2" height="14" rx="1" fill="white"/></svg>
                </button>
              </div>
              <span className="cnl-qty-unit">Units / Portions</span>
            </div>

            <div className="cnl-field">
              <label className="cnl-label">Listing Type</label>
              <div className="cnl-type-toggle">
                <button
                  className={`cnl-type-btn ${listingType === 'individual' ? 'active' : ''}`}
                  onClick={() => setListingType('individual')}
                  type="button"
                >
                  Individual
                </button>
                <button
                  className={`cnl-type-btn ${listingType === 'bundle' ? 'active' : ''}`}
                  onClick={() => setListingType('bundle')}
                  type="button"
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
          {loadingAllergens ? (
            <p style={{ fontSize: 13, color: '#707973' }}>Loading allergens…</p>
          ) : allergens.length === 0 ? (
            <p style={{ fontSize: 13, color: '#707973' }}>No allergen options available.</p>
          ) : (
            <div className="cnl-chips">
              {allergens.map((a) => (
                <button
                  key={a.allergenID}
                  className={`cnl-chip ${selectedAllergenIds.includes(a.allergenID) ? 'selected' : ''}`}
                  onClick={() => toggleAllergen(a.allergenID)}
                  type="button"
                >
                  <span>{a.name}</span>
                </button>
              ))}
            </div>
          )}
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
                type="number"
                min="0"
                step="0.01"
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
        <button className="cnl-btn-draft" onClick={onBack} disabled={isSubmitting} type="button">
          Cancel
        </button>
        <button
          className="cnl-btn-post"
          onClick={handleSubmit}
          disabled={isSubmitting || isUploadingImage}
          type="button"
        >
          {isSubmitting ? 'Posting…' : 'Post Surplus Food'}
        </button>
      </div>
    </div>
  );
}
