import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '../api/client'
import './ListingsFeed.css'
import ProductDetail from './ProductDetail'
import OrderSuccessModal from './OrderSuccessModal'
import NotificationDropdown from './NotificationDropdown'
import HistoryView from './HistoryView'
import ProfileView from './ProfileView'
import CharitiesListView from './CharitiesListView'
import CharityDetailView from './CharityDetailView'
import CharityApplicationForm from './CharityApplicationForm'
import type { User } from '../types/user'
import type { Food } from '../types/product'
import { Purchase } from '../types/purchase'

interface OrderItem {
  foodID: string
  name: string
  price: number
  qty: number
}

const CATEGORIES = ['All Items', 'Produce', 'Bakery', 'Dairy', 'Pantry']

export default function ListingsFeed({ user }: { user: User | null }) {
  const [listings, setListings] = useState<Food[]>([])
  const [activeCategory, setActiveCategory] = useState('All Items')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('GCash')
  const [selectedListing, setSelectedListing] = useState<Food | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [latestPurchaseID, setLatestPurchaseID] = useState<string | undefined>()
  const [showNotifs, setShowNotifs] = useState(false)
  const [activeTab, setActiveTab] = useState<'listings' | 'history' | 'profile' | 'charities'>('listings')
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await apiGet<Food[]>('/products/')
        setListings(data)
      } catch (err) {
        console.error('Failed to fetch listings:', err)
      }
    }
    fetchListings()
  }, [])

  const filtered =
    activeCategory === 'All Items'
      ? listings
      : listings.filter((l) => l.category === activeCategory)

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const total = subtotal

  const addFromDetail = (listing: Food, qty = 1) => {
    setOrderItems((prev) => {
      const existing = prev.find((o) => o.foodID === listing.foodID)
      if (existing) {
        return prev.map((o) =>
          o.foodID === listing.foodID ? { ...o, qty: o.qty + qty } : o
        )
      }
      return [...prev, { foodID: listing.foodID, name: listing.foodName, price: listing.price, qty }]
    })
  }

  const removeFromOrder = (id: string) => {
    setOrderItems((prev) => prev.filter((o) => o.foodID !== id))
  }

  const handleConfirmOrder = async () => {
    if (orderItems.length === 0) return
    
    setConfirming(true)
    try {
      const purchaseData = {
        paymentMethod,
        totalPrice: total,
        items: orderItems.map(item => ({
          foodID: item.foodID,
          quantity: item.qty,
          totalPerItem: item.price * item.qty
        }))
      }
      
      const result = await apiPost<Purchase>('/purchases/', purchaseData)
      setLatestPurchaseID(result.purchaseID)
      setShowSuccess(true)
      setOrderItems([])
    } catch (err) {
      console.error('Failed to confirm order:', err)
      alert('Failed to place order. Please try again.')
    } finally {
      setConfirming(false)
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
            <a href="#" className={`nav-link ${activeTab === 'charities' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('charities') }}>Charities</a>
            <a href="#" className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('history') }}>History</a>
            <a href="#" className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('profile') }}>Profile</a>
          </div>
          <div className="navbar-right" style={{ position: 'relative' }}>
            <button className="icon-btn" aria-label="Notifications" onClick={(e) => { e.stopPropagation(); setShowNotifs((v) => !v) }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#6B7280">
                <path d="M2 17V15H4V8C4 6.61667 4.4167 5.3875 5.25 4.3125C6.0833 3.2375 7.1667 2.5333 8.5 2.2V1.5C8.5 1.0833 8.6458 0.7292 8.9375 0.4375C9.2292 0.1458 9.5833 0 10 0C10.4167 0 10.7708 0.1458 11.0625 0.4375C11.3542 0.7292 11.5 1.0833 11.5 1.5V2.2C12.8333 2.5333 13.9167 3.2375 14.75 4.3125C15.5833 5.3875 16 6.6167 16 8V15H18V17H2ZM10 20C9.45 20 8.9792 19.8042 8.5875 19.4125C8.1958 19.0208 8 18.55 8 18H12C12 18.55 11.8042 19.0208 11.4125 19.4125C11.0208 19.8042 10.55 20 10 20ZM6 15H14V8C14 6.9 13.6083 5.9583 12.825 5.175C12.0417 4.3917 11.1 4 10 4C8.9 4 7.9583 4.3917 7.175 5.175C6.3917 5.9583 6 6.9 6 8V15Z" />
              </svg>
            </button>
            <button className="icon-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#6B7280">
                <circle cx="6" cy="20" r="2" />
                <circle cx="16" cy="20" r="2" />
                <path d="M5.15 4L7.55 9H14.55L17.3 4H5.15ZM4.2 2H18.95C19.3333 2 19.625 2.1708 19.8333 2.5125C20.0333 2.8542 20.0333 3.2 19.85 3.55L16.3 9.95C16.1167 10.2833 15.875 10.5417 15.5625 10.725C15.25 10.9083 14.9167 11 14.55 11H7.1L6 13H18V15H6C5.25 15 4.6833 14.6708 4.3 14.0125C3.9167 13.3542 3.9 12.7 4.25 12.05L5.6 9.6L2 2H0V0H3.25L4.2 2ZM7.55 9H14.55H7.55Z" />
              </svg>
            </button>
            <div className="avatar" aria-label="User profile" />

            {/* Notification dropdown */}
            {showNotifs && <NotificationDropdown onClose={() => setShowNotifs(false)} />}
          </div>
        </nav>
      </div>

      {/* Main content container (Figma rounded card) */}
      <div className="content-container">
        {activeTab === 'profile' ? (
          <ProfileView user={user} />
        ) : activeTab === 'history' ? (
          <HistoryView />
        ) : activeTab === 'charities' ? (
          showApplyForm ? (
            <CharityApplicationForm onBack={() => setShowApplyForm(false)} />
          ) : selectedCharityId ? (
            <CharityDetailView 
              charityUserId={selectedCharityId} 
              user={user}
              onBack={() => setSelectedCharityId(null)} 
            />
          ) : (
            <CharitiesListView 
              onViewCharity={(id) => setSelectedCharityId(id)} 
              onBecomeCharity={() => setShowApplyForm(true)} 
            />
          )
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

                {/* Category filters */}
                <div className="category-filters">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className="listings-grid">
                  {filtered.length === 0 ? (
                    <p className="no-listings">No food listings found for this category.</p>
                  ) : filtered.map((listing) => (
                    <div
                      key={listing.foodID}
                      className="listing-card"
                      onClick={() => setSelectedListing(listing)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Placeholder image */}
                      <div className="listing-img-placeholder" aria-label={`Image for ${listing.foodName}`}>
                        {listing.picture ? (
                          <img src={listing.picture} alt={listing.foodName} className="listing-img" />
                        ) : (
                          <>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span className="placeholder-label">No photo</span>
                          </>
                        )}
                      </div>

                      <div className="listing-info">
                        <div className="listing-header">
                          <span className="listing-name">{listing.foodName}</span>
                          <span className="listing-price">₱{listing.price.toFixed(2)}</span>
                        </div>
                        <p className="listing-desc">{listing.description}</p>

                        <div className="listing-meta">
                          <div className="meta-row">
                            <span className="icon-placeholder" style={{ width: 11, height: 12, background: '#707973' }} />
                            <span>Category: {listing.category}</span>
                          </div>
                          {listing.expirationDate && (
                            <div className="meta-row expiry">
                              <span className="icon-placeholder" style={{ width: 11, height: 12, background: '#BA1A1A' }} />
                              <span>Expiration: {new Date(listing.expirationDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Right: Order panel */}
            <div className="order-panel">
              <div className="order-header">
                <div className="order-header-row">
                  <span className="icon-placeholder" style={{ width: 18, height: 20, background: 'white' }} />
                  <span className="order-title">My order</span>
                </div>
                <div className="order-subtitle">
                  {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} in cart
                </div>
              </div>

              <div className="order-items">
                {orderItems.length === 0 ? (
                  <p className="order-empty">No items in your order yet.</p>
                ) : (
                  orderItems.map((item) => (
                    <div key={item.foodID} className="order-item">
                      <div className="order-item-img" />
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">Qty: {item.qty}</span>
                      </div>
                      <span className="order-item-price">₱{(item.price * item.qty).toFixed(2)}</span>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromOrder(item.foodID)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <span className="icon-placeholder" style={{ width: 12, height: 14, background: '#707973' }} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-total">
                <span className="total-label">Total</span>
                <span className="total-amount">₱{total.toFixed(2)}</span>
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
                disabled={orderItems.length === 0 || confirming}
                onClick={handleConfirmOrder}
              >
                <span>{confirming ? 'Confirming...' : 'Confirm Order'}</span>
                <span className="icon-placeholder" style={{ width: 13, height: 13, background: 'white' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <OrderSuccessModal
          purchaseID={latestPurchaseID}
          onClose={() => {
            setShowSuccess(false)
            setLatestPurchaseID(undefined)
          }}
        />
      )}
    </div>
  )
}
