import React, { useState, useRef } from 'react';
import type { CharityPost, ImpactStats } from '../api/types';
import { charityPostAPI, uploadsAPI, socialImpactAPI } from '../api/apis';
import OrderSuccessModal from './OrderSuccessModal';
import './DonateFoodDirectModal.css';

interface DonateFoodDirectModalProps {
  post: CharityPost;
  onClose: () => void;
  onSuccess: (updatedPost: CharityPost) => void;
}

function getApiError(err: unknown): string {
  const e = err as { response?: { data?: { detail?: string | { msg?: string }[] } } };
  const detail = e?.response?.data?.detail;
  if (!detail) return 'An unexpected error occurred.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg ?? '').join(', ');
  return 'An unexpected error occurred.';
}

export default function DonateFoodDirectModal({ post, onClose, onSuccess }: DonateFoodDirectModalProps) {
  const [foodName, setFoodName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [weightKg, setWeightKg] = useState<number>(0.5);
  const [quantity, setQuantity] = useState<number>(1);
  const [pictureUrl, setPictureUrl] = useState('');
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success impact state
  const [showSuccess, setShowSuccess] = useState(false);
  const [impactStats, setImpactStats] = useState<ImpactStats | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalKg = (quantity * weightKg).toFixed(2);

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
      const res = await uploadsAPI.uploadImage(file);
      setPictureUrl(res.data.imageUrl);
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
    if (!foodName.trim()) { setError('Food name is required.'); return; }
    if (!expiryDate) { setError('Expiry date is required.'); return; }
    if (new Date(expiryDate) < new Date(new Date().setHours(0,0,0,0))) {
        setError('Expiry date cannot be in the past.');
        return;
    }
    if (weightKg <= 0) { setError('Weight must be greater than zero.'); return; }
    if (quantity <= 0) { setError('Quantity must be greater than zero.'); return; }

    setIsSubmitting(true);
    try {
      const response = await charityPostAPI.donateDirectToPost(post.charityID, {
        foodName: foodName.trim(),
        foodPicture: pictureUrl || '',
        expiryDate: expiryDate,
        weightKg: weightKg,
        quantity: quantity,
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
      setError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess && impactStats) {
    return <OrderSuccessModal stats={impactStats} onClose={onClose} title="Donation Successful!" />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="donate-direct-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h2>Donate Food</h2>
            <p>Directly describe the food you're giving to <strong>{post.title}</strong></p>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-notice">
              {error}
            </div>
          )}

          <div className="donate-bento-grid">
            {/* Food Info Section */}
            <div className="donate-card food-info">
              <div className="field">
                <label className="label">Food Name *</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. 10 Cans of Sardines"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                />
              </div>

              <div className="field-row">
                <div className="field half">
                  <label className="label">Expiry Date *</label>
                  <input
                    className="input"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().substring(0, 10)}
                  />
                </div>
                <div className="field half">
                    <label className="label">Weight per unit (kg) *</label>
                    <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={weightKg}
                        onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    />
                </div>
              </div>

              <div className="field">
                <label className="label">Quantity *</label>
                <div className="quantity-control">
                  <button
                    className="qty-btn qty-minus"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    type="button"
                  >
                    <svg width="14" height="2" viewBox="0 0 14 2" fill="none"><rect width="14" height="2" rx="1" fill="#66B018"/></svg>
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn qty-plus"
                    onClick={() => setQuantity(quantity + 1)}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect y="6" width="14" height="2" rx="1" fill="white"/><rect x="6" width="2" height="14" rx="1" fill="white"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="donate-card media-upload">
              <div
                className="upload-zone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => !isUploadingImage && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                />
                <div className="upload-dashed">
                  {picturePreview ? (
                    <img src={picturePreview} alt="Preview" className="preview-img" />
                  ) : (
                    <div className="upload-placeholder">
                      {isUploadingImage ? (
                        <span className="upload-text" style={{ color: '#66B018' }}>Uploading…</span>
                      ) : (
                        <>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#BFC9C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="upload-text">Upload Photo (Optional)</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="total-display">
                <span className="total-label">Estimated Total:</span>
                <span className="total-value">{totalKg} kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="confirm-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImage}
          >
            {isSubmitting ? 'Processing...' : 'Donate Food'}
          </button>
        </div>
      </div>
    </div>
  );
}
