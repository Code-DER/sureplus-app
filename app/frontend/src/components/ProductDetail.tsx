import { useState } from 'react'
import './ProductDetail.css'
import type { FoodItem } from '../types/food'

// Re-exported so ListingsFeed can use it via the same import path it always has
export type { FoodItem as FoodListingFull }

interface ProductDetailProps {
  listing: FoodItem
  onBack: () => void
  onAddToOrder: (listing: FoodItem, qty: number) => void
}

function formatExpiration(dateStr: string | null): string {
  if (!dateStr) return 'No expiry date'
  const exp = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Expires today'
  if (diffDays === 1) return 'Expires tomorrow'
  if (diffDays <= 7) return `Expires in ${diffDays} days`
  return exp.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
}

export default function ProductDetail({ listing, onBack, onAddToOrder }: ProductDetailProps) {
  const [qty, setQty] = useState(1)

  const allergenNames = listing.allergens.map((a) => a.name)

  return (
    <div className="detail-panel">
      {/* Back button */}
      <button className="detail-back-btn" onClick={onBack}>
        ← Back to Listings
      </button>

      {/* Header */}
      <div className="detail-header">
        <h1 className="detail-title">Additional Details</h1>
        <p className="detail-subtitle">High-quality surplus food from local favorites at sustainable prices.</p>
      </div>

      {/* Two-column body */}
      <div className="detail-body">
        {/* Image */}
        <div className="detail-image">
          {listing.picture ? (
            <img
              src={listing.picture}
              alt={listing.foodName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
            />
          ) : (
            <div className="detail-image-placeholder">
              <span className="icon-placeholder" style={{ width: 48, height: 48, background: '#ddd', borderRadius: 8 }} />
              <span>No Product Photo</span>
            </div>
          )}
        </div>

        {/* Quick info panel */}
        <div className="detail-info-panel">
          <h2 className="detail-product-name">{listing.foodName}</h2>
          <p className="detail-product-desc">{listing.description ?? 'No description provided.'}</p>

          {/* Allergen safety badge */}
          {listing.isSafeForCurrentUser === false && (
            <div style={{
              background: '#FFF3E0', border: '1px solid #FFA726', borderRadius: 8,
              padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#E65100'
            }}>
              ⚠ This item contains allergens you're sensitive to
            </div>
          )}

          {/* Allergens */}
          {allergenNames.length > 0 && (
            <>
              <span className="detail-allergens-label">Allergens</span>
              <div className="detail-allergen-tags">
                {allergenNames.map((name) => (
                  <div
                    key={name}
                    className="allergen-tag"
                    style={listing.matchedAllergenIDs.length > 0 ? { borderColor: '#FFA726', background: '#FFF8F0' } : {}}
                  >
                    <span className="icon-placeholder" style={{ width: 12, height: 12, background: '#0F5238' }} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Price + Quantity */}
          <div className="detail-price-row">
            <div className="detail-price-block">
              <span className="detail-price-label">Price</span>
              <span className="detail-price-value">₱{Number(listing.price).toFixed(2)}</span>
            </div>

            <div className="qty-selector">
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                disabled={qty <= 1}
              >
                <span className="icon-placeholder" style={{ width: 14, height: 2, background: '#191C1A' }} />
              </button>
              <span className="qty-value">{qty}</span>
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.min(listing.stockQuantity, q + 1))}
                aria-label="Increase quantity"
                disabled={qty >= listing.stockQuantity}
              >
                <span className="icon-placeholder" style={{ width: 14, height: 14, background: '#191C1A' }} />
              </button>
            </div>
          </div>

          {listing.stockQuantity === 0 && (
            <p style={{ color: '#BA1A1A', fontSize: 13, margin: '-8px 0 8px' }}>Out of stock</p>
          )}

          {/* Add to Order */}
          <button
            className="detail-add-btn"
            disabled={listing.stockQuantity === 0}
            onClick={() => {
              onAddToOrder(listing, qty)
              onBack()
            }}
          >
            <span className="icon-placeholder" style={{ width: 20, height: 20, background: '#FFFFFF' }} />
            <span>Add to Order</span>
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="detail-info-cards">
        <div className="info-card">
          <div className="info-card-icon">
            <span className="icon-placeholder" style={{ width: 18, height: 20, background: '#0F5238' }} />
          </div>
          <div className="info-card-content">
            <span className="info-card-label">Expiry Date</span>
            <span className="info-card-value">{formatExpiration(listing.expirationDate)}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-card-icon">
            <span className="icon-placeholder" style={{ width: 16, height: 20, background: '#0F5238' }} />
          </div>
          <div className="info-card-content">
            <span className="info-card-label">Stock Available</span>
            <span className="info-card-value">{listing.stockQuantity} unit{listing.stockQuantity !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
