import { useState } from 'react'
import './ProductDetail.css'

export interface FoodListingFull {
  id: number
  name: string
  price: number
  description: string
  fullDescription: string
  category: string
  availableTime: string
  expiration: string
  allergens: string[]
  location: string
}

interface ProductDetailProps {
  listing: FoodListingFull
  onBack: () => void
  onAddToOrder: (listing: FoodListingFull, qty: number) => void
}

export default function ProductDetail({ listing, onBack, onAddToOrder }: ProductDetailProps) {
  const [qty, setQty] = useState(1)

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })

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
        {/* Large image */}
        <div className="detail-image">
          <div className="detail-image-placeholder">
            <span className="icon-placeholder" style={{ width: 48, height: 48, background: '#ddd', borderRadius: 8 }} />
            <span>Product Photo</span>
          </div>
        </div>

        {/* Quick info panel */}
        <div className="detail-info-panel">
          <h2 className="detail-product-name">{listing.name}</h2>
          <p className="detail-product-desc">{listing.fullDescription}</p>

          {/* Allergens */}
          <span className="detail-allergens-label">Allergens</span>
          <div className="detail-allergen-tags">
            {listing.allergens.map((allergen) => (
              <div key={allergen} className="allergen-tag">
                <span className="icon-placeholder" style={{ width: 12, height: 12, background: '#0F5238' }} />
                <span>{allergen}</span>
              </div>
            ))}
          </div>

          {/* Price + Quantity */}
          <div className="detail-price-row">
            <div className="detail-price-block">
              <span className="detail-price-label">Price</span>
              <span className="detail-price-value">₱{listing.price.toFixed(2)}</span>
            </div>

            <div className="qty-selector">
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <span className="icon-placeholder" style={{ width: 14, height: 2, background: '#191C1A' }} />
              </button>
              <span className="qty-value">{qty}</span>
              <button
                className="qty-btn"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <span className="icon-placeholder" style={{ width: 14, height: 14, background: '#191C1A' }} />
              </button>
            </div>
          </div>

          {/* Add to Order */}
          <button
            className="detail-add-btn"
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
            <span className="info-card-value">{formattedDate}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-card-icon">
            <span className="icon-placeholder" style={{ width: 16, height: 20, background: '#0F5238' }} />
          </div>
          <div className="info-card-content">
            <span className="info-card-label">Location</span>
            <span className="info-card-value small">{listing.location}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
