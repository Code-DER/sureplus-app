import { useState, useEffect, useRef } from 'react'
import './ListingsFeed.css'
import ProductDetail from './ProductDetail'
import NotificationBell from './NotificationBell'
import HistoryView from './HistoryView'
import ProfileView from './ProfileView'
import CharityPostsFeed from './CharityPostsFeed'
import SocialImpactView from './SocialImpactView'
import Toast, { type ToastItem } from './Toast'
import { foodAPI, purchaseAPI, getAuthUser, userAPI } from '../api/apis'
import { formatExpiration } from '../utils/format'
import UserAvatar from './UserAvatar'
import type { FoodItem } from '../types/food'

interface ListingsFeedProps {
  isSeller?: boolean
  onOpenSellerDashboard?: () => void
}

import ExpiryIcon from '../assets/BUYER/Expiry Icon.svg'
import CartIcon from '../assets/BUYER/Cart Icon.svg'

interface OrderItem {
  id: string       // foodID (UUID)
  name: string
  price: number
  qty: number
  weightKg: number
  picture: string | null
}

export default function ListingsFeed({ isSeller, onOpenSellerDashboard }: ListingsFeedProps) {
  const authUser = getAuthUser()

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

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastCounter = useRef(0)

  const showToast = (message: string, type: ToastItem['type'] = 'error') => {
    const id = ++toastCounter.current
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // ── Order state ───────────────────────────────────────────────────────────
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [currentShopUserID, setCurrentShopUserID] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('GCash')
  const [selectedListing, setSelectedListing] = useState<FoodItem | null>(null)
  const [showPendingSuccess, setShowPendingSuccess] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'listings' | 'charity' | 'history' | 'impact' | 'profile'>('listings')

  const [isOrdering, setIsOrdering] = useState(false)

  // ── Order helpers ─────────────────────────────────────────────────────────
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)

  const addToOrder = (
    listing: { id: string; name: string; price: number; weightKg: number; picture: string | null; sellerUserID: string },
    qty = 1
  ): boolean => {
    const authUser = getAuthUser()

    // Rule 1 — seller cannot buy from own shop
    if (authUser && listing.sellerUserID === authUser.userID) {
      showToast('You cannot purchase products from your own shop.', 'error')
      return false
    }

    // Rule 2 — single shop per order
    if (currentShopUserID && listing.sellerUserID !== currentShopUserID) {
      showToast('You can only order from one shop at a time. Please clear your current order first.', 'error')
      return false
    }

    if (!currentShopUserID) {
      setCurrentShopUserID(listing.sellerUserID)
    }

    setOrderItems((prev) => {
      const existing = prev.find((o) => o.id === listing.id)
      if (existing) {
        return prev.map((o) =>
          o.id === listing.id ? { ...o, qty: o.qty + qty } : o
        )
      }
      return [...prev, { id: listing.id, name: listing.name, price: listing.price, qty, weightKg: listing.weightKg, picture: listing.picture }]
    })
    return true
  }

  const addFromDetail = (listing: FoodItem, qty: number): boolean => {
    return addToOrder({
      id: listing.foodID,
      name: listing.foodName,
      price: Number(listing.price),
      weightKg: listing.weightKg,
      picture: listing.picture,
      sellerUserID: listing.userID,
    }, qty)
  }

  const removeFromOrder = (id: string) => {
    setOrderItems((prev) => {
      const remaining = prev.filter((o) => o.id !== id)
      if (remaining.length === 0) setCurrentShopUserID(null)
      return remaining
    })
  }

  const handleCardClick = (item: FoodItem) => {
    if (authUser && item.userID === authUser.userID) {
      showToast('You cannot purchase products from your own shop.', 'error')
      return
    }
    if (currentShopUserID && item.userID !== currentShopUserID) {
      showToast('You can only order from one shop at a time. Please clear your current order first.', 'error')
      return
    }
    setSelectedListing(item)
  }

  const handleConfirmOrder = async () => {
    const user = getAuthUser()
    if (!user) {
      showToast('Please log in to place an order.', 'error')
      return
    }

    setIsOrdering(true)
    try {
      await purchaseAPI.create({
        paymentMethod,
        items: orderItems.map(item => ({
          foodID: item.id,
          quantity: item.qty
        }))
      })

      setShowPendingSuccess(true)
      setOrderItems([])
      setCurrentShopUserID(null)
    } catch (err: any) {
      console.error('Order failed:', err)
      showToast(err?.response?.data?.detail || 'Failed to place order. Please try again.', 'error')
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <div className="listings-page">
      {/* Navbar */}
      <div className="navbar-wrapper">
        <nav className="navbar">
          <div className="navbar-left">
            <span className="brand">Sureplus</span>
            <div className="nav-links-desktop">
              <button type="button" className={`nav-link ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>Listings</button>
              <button type="button" className={`nav-link ${activeTab === 'charity' ? 'active' : ''}`} onClick={() => setActiveTab('charity')}>Charity</button>
              <button type="button" className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
              <button type="button" className={`nav-link ${activeTab === 'impact' ? 'active' : ''}`} onClick={() => setActiveTab('impact')}>Impact</button>
              <button type="button" className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            </div>
          </div>
          <div className="navbar-right">
            {isSeller && onOpenSellerDashboard && (
              <button
                type="button"
                className="seller-dashboard-btn nav-desktop-only"
                onClick={onOpenSellerDashboard}
              >
                Seller Dashboard
              </button>
            )}
            <NotificationBell buttonClassName="icon-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#6B7280">
                <path d="M2 17V15H4V8C4 6.61667 4.4167 5.3875 5.25 4.3125C6.0833 3.2375 7.1667 2.5333 8.5 2.2V1.5C8.5 1.0833 8.6458 0.7292 8.9375 0.4375C9.2292 0.1458 9.5833 0 10 0C10.4167 0 10.7708 0.1458 11.0625 0.4375C11.3542 0.7292 11.5 1.0833 11.5 1.5V2.2C12.8333 2.5333 13.9167 3.2375 14.75 4.3125C15.5833 5.3875 16 6.6167 16 8V15H18V17H2ZM10 20C9.45 20 8.9792 19.8042 8.5875 19.4125C8.1958 19.0208 8 18.55 8 18H12C12 18.55 11.8042 19.0208 11.4125 19.4125C11.0208 19.8042 10.55 20 10 20ZM6 15H14V8C14 6.9 13.6083 5.9583 12.825 5.175C12.0417 4.3917 11.1 4 10 4C8.9 4 7.9583 4.3917 7.175 5.175C6.3917 5.9583 6 6.9 6 8V15Z" />
              </svg>
            </NotificationBell>
            <UserAvatar
              firstName={navProfile?.firstName}
              lastName={navProfile?.lastName}
              size={32}
              className="navbar-avatar"
              onClick={() => setActiveTab('profile')}
              title="View Profile"
            />
            <button className="icon-btn nav-hamburger-btn nav-mobile-only" aria-label="Open menu" onClick={(e) => { e.stopPropagation(); setNavOpen(v => !v) }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </nav>
        {navOpen && (
          <>
            <div className="mobile-nav-overlay" onClick={() => setNavOpen(false)} />
            <div className="mobile-nav-menu">
              {(['listings', 'charity', 'history', 'impact', 'profile'] as const).map(tab => (
                <button key={tab} className={`mobile-nav-link ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => { setActiveTab(tab); setNavOpen(false); }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              {isSeller && onOpenSellerDashboard && (
                <button className="mobile-nav-link mobile-nav-seller" onClick={() => { onOpenSellerDashboard(); setNavOpen(false); }}>
                  Seller Dashboard
                </button>
              )}
            </div>
          </>
        )}
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

                {/* Shop lock banner */}
                {currentShopUserID && (
                  <div className="shop-lock-banner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Showing products from one shop. Clear your order to browse all shops.</span>
                    <button
                      className="shop-lock-clear"
                      onClick={() => { setOrderItems([]); setCurrentShopUserID(null) }}
                    >
                      Clear order
                    </button>
                  </div>
                )}

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
                  <div className="listings-grid" aria-busy="true" aria-label="Loading listings">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="listing-card listing-card--skeleton" aria-hidden="true">
                        <div className="listing-img-placeholder listing-img-skeleton" />
                        <div className="listing-info">
                          <div className="skeleton-line" />
                          <div className="skeleton-line skeleton-line--short" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error state */}
                {!loadingListings && listingsError && (
                  <div className="listings-error" role="alert">
                    <p>{listingsError}</p>
                    <button className="listings-error-retry" onClick={() => setSafeForMe((v) => v)}>
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {!loadingListings && !listingsError && listings.length === 0 && (
                  <div className="listings-empty">
                    <p className="listings-empty-title">No listings found</p>
                    <p className="listings-empty-body">
                      {safeForMe
                        ? 'No allergen-safe listings are available right now.'
                        : 'No food listings are available right now. Check back soon!'}
                    </p>
                  </div>
                )}

                {/* Grid */}
                {!loadingListings && !listingsError && listings.length > 0 && (
                  <div className="listings-grid">
                    {listings.map((item) => {
                      const isOwnShop = authUser !== null && item.userID === authUser.userID
                      const isLocked = isOwnShop || (currentShopUserID !== null && item.userID !== currentShopUserID)
                      return (
                        <div
                          key={item.foodID}
                          className={`listing-card${isLocked ? ' listing-card--locked' : ''}`}
                          onClick={() => handleCardClick(item)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleCardClick(item)}
                          aria-label={isLocked ? `${item.foodName} — from a different shop` : `View details for ${item.foodName}`}
                          aria-disabled={isLocked}
                        >
                          {item.picture ? (
                            <img
                              className="listing-img-placeholder"
                              src={item.picture}
                              alt={item.foodName}
                            />
                          ) : (
                            <div className="listing-img-placeholder" role="img" aria-label={`No photo for ${item.foodName}`}>
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" aria-hidden="true">
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
                                  <img src={ExpiryIcon} alt="" width="11" height="12" aria-hidden="true" />
                                  <span>{item.stockQuantity} available</span>
                                </div>
                              ) : (
                                <div className="meta-row oos">
                                  <span>Out of stock</span>
                                </div>
                              )}
                              {item.expirationDate && (
                                <div className="meta-row expiry">
                                  <img src={ExpiryIcon} alt="" width="11" height="12" aria-hidden="true" />
                                  <span>Expiration: {formatExpiration(item.expirationDate)}</span>
                                </div>
                              )}
                            </div>

                            {item.isSafeForCurrentUser === false && (
                              <div className="listing-allergen-warning" role="alert">
                                ⚠ Contains your allergens
                              </div>
                            )}

                            {isLocked && (
                              <div className="listing-locked-hint">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                {isOwnShop ? 'Your listing' : 'Different shop'}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
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
                      <div className="order-item-img">
                        {item.picture && (
                          <img
                            src={item.picture}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        )}
                      </div>
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
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
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
                disabled={orderItems.length === 0 || isOrdering}
                onClick={handleConfirmOrder}
              >
                <span>Confirm Order</span>
                <img src={CartIcon} alt="Cart" width="13" height="13" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pending Success Modal */}
      {showPendingSuccess && (
        <div className="pending-success-overlay" onClick={() => setShowPendingSuccess(false)}>
          <div className="pending-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pending-success-icon">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#E8F5E9"/>
                <path d="M18 28.5L24.5 35L38 21" stroke="#2D6A4F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="pending-success-heading">Order Placed!</h2>
            <p className="pending-success-sub">Awaiting Seller Approval</p>
            <p className="pending-success-body">Your order has been submitted. The seller will review and approve it shortly. You can track your order status in History.</p>
            <button className="pending-success-btn" onClick={() => setShowPendingSuccess(false)}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
