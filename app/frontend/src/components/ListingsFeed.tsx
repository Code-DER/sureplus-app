import { useState, useEffect } from 'react'
import './ListingsFeed.css'
import ProductDetail from './ProductDetail'
import OrderSuccessModal, { type ImpactStats } from './OrderSuccessModal'
import NotificationDropdown from './NotificationDropdown'
import HistoryView from './HistoryView'
import ProfileView from './ProfileView'
import CharityPostsFeed from './CharityPostsFeed'
import SocialImpactView from './SocialImpactView'
import { foodAPI, userAPI } from '../api/apis'
import UserAvatar from './UserAvatar'
import type { FoodItem } from '../types/food'
import { purchaseAPI } from '../api/apis'

interface ListingsFeedProps {
  isSeller?: boolean
  onOpenSellerDashboard?: () => void
}

import ExpiryIcon from '../assets/BUYER/Expiry Icon.svg'
import CartIcon from '../assets/BUYER/Cart Icon.svg'
import LocationIcon from '../assets/BUYER/location.svg'

interface OrderItem {
  id: string       // foodID (UUID)
  name: string
  price: number
  qty: number
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
  if (diffDays <= 7) return `In ${diffDays} days`
  return exp.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export default function ListingsFeed({ isSeller, onOpenSellerDashboard }: ListingsFeedProps) {
  // ── Listings API state ────────────────────────────────────────────────────
  const [listings, setListings] = useState<FoodItem[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [listingsError, setListingsError] = useState<string | null>(null)
  const [safeForMe, setSafeForMe] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchListings() {
      setLoadingListings(true)
      setListingsError(null)
      try {
        const resp = await foodAPI.list({
          safe_for_me: safeForMe,
          edible_only: true,
          include_expired: false,
        })
        if (!cancelled) setListings(resp.data)
      } catch {
        if (!cancelled) setListingsError('Failed to load listings. Please try again.')
      } finally {
        if (!cancelled) setLoadingListings(false)
      }
    }
    fetchListings()
    return () => { cancelled = true }
  }, [safeForMe])

  // ── Nav profile for avatar ────────────────────────────────────────────────
  const [navProfile, setNavProfile] = useState<{ firstName?: string; lastName?: string } | null>(null)
  useEffect(() => {
    userAPI.getMyProfile().then(r => setNavProfile(r.data)).catch(() => {})
  }, [])

  // ── Order state ───────────────────────────────────────────────────────────
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('GCash')
  const [selectedListing, setSelectedListing] = useState<FoodItem | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [activeTab, setActiveTab] = useState<'listings' | 'charity' | 'history' | 'impact' | 'profile'>('listings')

  const [impactStats] = useState<ImpactStats>({
    foodSaved: 67,
    carbonReduced: 32,
    peopleFed: 40,
    pointsEarned: 67,
  })

  // ── Order helpers ─────────────────────────────────────────────────────────
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)

  const addToOrder = (listing: { id: string; name: string; price: number }, qty = 1) => {
    setOrderItems((prev) => {
      const existing = prev.find((o) => o.id === listing.id)
      if (existing) {
        return prev.map((o) =>
          o.id === listing.id ? { ...o, qty: o.qty + qty } : o
        )
      }
      return [...prev, { id: listing.id, name: listing.name, price: listing.price, qty }]
    })
  }

  const addFromDetail = (listing: FoodItem, qty: number) => {
    addToOrder({ id: listing.foodID, name: listing.foodName, price: Number(listing.price) }, qty)
  }

  const removeFromOrder = (id: string) => {
    setOrderItems((prev) => prev.filter((o) => o.id !== id))
  }

  const handleConfirmOrder = async () => {
    try {
      const payload = {
        paymentMethod,
        items: orderItems.map(item => ({
          foodID: item.id,
          quantity: item.qty
        }))
      }

      const response = await purchaseAPI.createPurchase(payload)

      console.log("Purchase success:", response.data)

      setShowSuccess(true)
      setOrderItems([])

    } catch (error: any) {
        console.log("FULL ERROR:", error)
        console.log("RESPONSE:", error?.response?.data)

        alert(
          error?.response?.data?.detail ||
          "Failed to place order"
        )
    }
  }

  return (
    <div className="listings-page">
      {/* Navbar */}
      <div className="navbar-wrapper">
        <nav className="navbar">
          <div className="navbar-left">
            <span className="brand">Sureplus</span>
            <a href="#" className={`nav-link ${activeTab === 'listings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('listings') }}>Listings</a>
            <a href="#" className={`nav-link ${activeTab === 'charity' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('charity') }}>Charity</a>
            <a href="#" className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('history') }}>History</a>
            <a href="#" className={`nav-link ${activeTab === 'impact' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('impact') }}>Impact</a>
            <a href="#" className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('profile') }}>Profile</a>
          </div>
          <div className="navbar-right" style={{ position: 'relative' }}>
            {isSeller && onOpenSellerDashboard && (
              <button
                type="button"
                className="seller-dashboard-btn"
                onClick={onOpenSellerDashboard}
              >
                Seller Dashboard
              </button>
            )}
            <button className="icon-btn" aria-label="Notifications" onClick={(e) => { e.stopPropagation(); setShowNotifs((v) => !v) }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#6B7280">
                <path d="M2 17V15H4V8C4 6.61667 4.4167 5.3875 5.25 4.3125C6.0833 3.2375 7.1667 2.5333 8.5 2.2V1.5C8.5 1.0833 8.6458 0.7292 8.9375 0.4375C9.2292 0.1458 9.5833 0 10 0C10.4167 0 10.7708 0.1458 11.0625 0.4375C11.3542 0.7292 11.5 1.0833 11.5 1.5V2.2C12.8333 2.5333 13.9167 3.2375 14.75 4.3125C15.5833 5.3875 16 6.6167 16 8V15H18V17H2ZM10 20C9.45 20 8.9792 19.8042 8.5875 19.4125C8.1958 19.0208 8 18.55 8 18H12C12 18.55 11.8042 19.0208 11.4125 19.4125C11.0208 19.8042 10.55 20 10 20ZM6 15H14V8C14 6.9 13.6083 5.9583 12.825 5.175C12.0417 4.3917 11.1 4 10 4C8.9 4 7.9583 4.3917 7.175 5.175C6.3917 5.9583 6 6.9 6 8V15Z" />
              </svg>
            </button>
            {/* <button className="icon-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#6B7280">
                <circle cx="6" cy="20" r="2" />
                <circle cx="16" cy="20" r="2" />
                <path d="M5.15 4L7.55 9H14.55L17.3 4H5.15ZM4.2 2H18.95C19.3333 2 19.625 2.1708 19.8333 2.5125C20.0333 2.8542 20.0333 3.2 19.85 3.55L16.3 9.95C16.1167 10.2833 15.875 10.5417 15.5625 10.725C15.25 10.9083 14.9167 11 14.55 11H7.1L6 13H18V15H6C5.25 15 4.6833 14.6708 4.3 14.0125C3.9167 13.3542 3.9 12.7 4.25 12.05L5.6 9.6L2 2H0V0H3.25L4.2 2ZM7.55 9H14.55H7.55Z" />
              </svg>
            </button> */}
            <UserAvatar
              firstName={navProfile?.firstName}
              lastName={navProfile?.lastName}
              size={32}
              className="navbar-avatar"
              onClick={() => setActiveTab('profile')}
              title="View Profile"
            />

            {showNotifs && <NotificationDropdown onClose={() => setShowNotifs(false)} />}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="content-container">
        {activeTab === 'profile' ? (
          <ProfileView />
        ) : activeTab === 'history' ? (
          <HistoryView />
        ) : activeTab === 'charity' ? (
          <CharityPostsFeed />
        ) : activeTab === 'impact' ? (
          <SocialImpactView />
        ) : (
          <div className="listings-content">
            {selectedListing ? (
              <ProductDetail
                listing={selectedListing}
                onBack={() => setSelectedListing(null)}
                onAddToOrder={addFromDetail}
              />
            ) : (
              <div className="listings-panel">
                {/* Header */}
                <div className="listings-header">
                  <h1 className="listings-title">Listings</h1>
                  <p className="listings-subtitle">High-quality surplus food from local favorites at sustainable prices.</p>
                </div>

                {/* Filters */}
                <div className="category-filters">
                  <button
                    className={`filter-btn ${!safeForMe ? 'active' : ''}`}
                    onClick={() => setSafeForMe(false)}
                  >
                    All Items
                  </button>
                  <button
                    className={`filter-btn ${safeForMe ? 'active' : ''}`}
                    onClick={() => setSafeForMe(true)}
                  >
                    Safe for Me
                  </button>
                </div>

                {/* Loading state */}
                {loadingListings && (
                  <div className="listings-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="listing-card" style={{ opacity: 0.5 }}>
                        <div className="listing-img-placeholder" style={{ background: '#f0f0f0' }} />
                        <div className="listing-info">
                          <div style={{ height: 16, background: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
                          <div style={{ height: 12, background: '#e8e8e8', borderRadius: 4, width: '60%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error state */}
                {!loadingListings && listingsError && (
                  <div style={{
                    padding: '40px 24px', textAlign: 'center', color: '#BA1A1A',
                    background: '#FFEBEE', borderRadius: 12, margin: '24px 0'
                  }}>
                    <p style={{ margin: '0 0 16px', fontSize: 16 }}>{listingsError}</p>
                    <button
                      onClick={() => setSafeForMe((v) => v)}
                      style={{
                        background: '#BA1A1A', color: 'white', border: 'none',
                        borderRadius: 8, padding: '8px 20px', cursor: 'pointer'
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {!loadingListings && !listingsError && listings.length === 0 && (
                  <div style={{ padding: '60px 24px', textAlign: 'center', color: '#707973' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No listings found</p>
                    <p style={{ fontSize: 14, margin: 0 }}>
                      {safeForMe
                        ? 'No allergen-safe listings are available right now.'
                        : 'No food listings are available right now. Check back soon!'}
                    </p>
                  </div>
                )}

                {/* Grid */}
                {!loadingListings && !listingsError && listings.length > 0 && (
                  <div className="listings-grid">
                    {listings.map((item) => (
                      <div
                        key={item.foodID}
                        className="listing-card"
                        onClick={() => setSelectedListing(item)}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.picture ? (
                          <img
                            className="listing-img-placeholder"
                            src={item.picture}
                            alt={item.foodName}
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="listing-img-placeholder" aria-label={`Image for ${item.foodName}`}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span className="placeholder-label">No photo</span>
                          </div>
                        )}

                        <div className="listing-info">
                          <div className="listing-header">
                            <span className="listing-name">{item.foodName}</span>
                            <span className="listing-price">₱{Number(item.price).toFixed(2)}</span>
                          </div>
                          <p className="listing-desc">{item.description ?? ''}</p>

                          <div className="listing-meta">
                            {item.stockQuantity > 0 ? (
                              <div className="meta-row">
                                <img src={ExpiryIcon} alt="Expiry" width="11" height="12" />
                                <span>{item.stockQuantity} available</span>
                              </div>
                            ) : (
                              <div className="meta-row" style={{ color: '#BA1A1A' }}>
                                <span>Out of stock</span>
                              </div>
                            )}
                            {item.expirationDate && (
                              <div className="meta-row expiry">
                                <img src={ExpiryIcon} alt="Expiry" width="11" height="12" />
                                <span>Expiration: {formatExpiration(item.expirationDate)}</span>
                              </div>
                            )}
                          </div>

                          {item.isSafeForCurrentUser === false && (
                            <div style={{ fontSize: 11, color: '#E65100', marginTop: 6, fontWeight: 600 }}>
                              ⚠ Contains your allergens
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order panel */}
            <div className="order-panel">
              <div className="order-header">
                <div className="order-header-row">
                  <img src={CartIcon} alt="Cart" width="18" height="20" />
                  <span className="order-title">My order</span>
                </div>
                <div className="order-subtitle">
                  {orderItems.length === 0
                    ? 'No items yet'
                    : `${orderItems.length} item${orderItems.length !== 1 ? 's' : ''}`}
                </div>
              </div>

              <div className="order-items">
                {orderItems.length === 0 ? (
                  <p className="order-empty">No items in your order yet.</p>
                ) : (
                  orderItems.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="order-item-img" aria-label={item.name} />
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">Qty: {item.qty}</span>
                      </div>
                      <span className="order-item-price">₱{(item.price * item.qty).toFixed(2)}</span>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromOrder(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <img src={LocationIcon} alt="Location" width="12" height="14" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-total">
                <span className="total-label">Total</span>
                <span className="total-amount">₱{subtotal.toFixed(2)}</span>
              </div>

              <div className="payment-row">
                <span className="payment-label">Mode of Payment</span>
                <select
                  className="payment-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>GCash</option>
                  <option>Cash on Delivery</option>
                  <option>Maya</option>
                </select>
              </div>

              <button
                className="confirm-btn"
                disabled={orderItems.length === 0}
                onClick={handleConfirmOrder}
              >
                <span>Confirm Order</span>
                <img src={CartIcon} alt="Cart" width="13" height="13" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <OrderSuccessModal
          stats={impactStats}
          onClose={() => {
            setShowSuccess(false)
            setOrderItems([])
          }}
        />
      )}
    </div>
  )
}
