import { useState } from 'react'
import './ListingsFeed.css'
import ProductDetail, { type FoodListingFull } from './ProductDetail'
import OrderSuccessModal, { type ImpactStats } from './OrderSuccessModal'
import NotificationDropdown from './NotificationDropdown'
import HistoryView from './HistoryView'
import ProfileView from './ProfileView'

interface FoodListing {
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

interface OrderItem {
  id: number
  name: string
  price: number
  qty: number
}

const LISTINGS: FoodListing[] = [
  {
    id: 1,
    name: 'Sourdough Bread Loaf',
    price: 300,
    description: 'Freshly baked, slight crust crack, perfect for toast or sandwiches...',
    fullDescription: 'Freshly baked daily using a 5-year-old starter. This surplus loaf is perfectly crusty on the outside and airy on the inside. Great for morning toast, sandwiches, or pairing with soup.',
    category: 'Bakery',
    availableTime: 'Today, 6:00 PM',
    expiration: 'Tomorrow',
    allergens: ['Contains Gluten', 'Dairy'],
    location: 'SM Ecoland, Matina Pangi Road, Davao City',
  },
  {
    id: 2,
    name: 'Mixed Vegetable Box',
    price: 150,
    description: 'Assorted greens, carrots, and tomatoes. Great for soups or stir-fry...',
    fullDescription: 'A curated box of fresh assorted greens, carrots, tomatoes, and bell peppers sourced from local farms. Ideal for soups, stir-fry, or salads. Lightly surplus from a restaurant prep.',
    category: 'Produce',
    availableTime: 'Today, 6:00 PM',
    expiration: 'Tomorrow',
    allergens: ['None'],
    location: 'Abreeza Mall, J.P. Laurel Avenue, Davao City',
  },
  {
    id: 3,
    name: 'Greek Yogurt (500g)',
    price: 100,
    description: 'Creamy, high-protein yogurt near best-by date. Still perfectly fresh...',
    fullDescription: 'Creamy, high-protein Greek yogurt approaching its best-by date but still perfectly fresh and safe. Great for breakfast bowls, smoothies, or as a healthy snack with honey and granola.',
    category: 'Dairy',
    availableTime: 'Today, 6:00 PM',
    expiration: 'Tomorrow',
    allergens: ['Contains Dairy'],
    location: 'SM Lanang Premier, Davao City',
  },
  {
    id: 4,
    name: 'Brown Rice (2kg)',
    price: 200,
    description: 'Whole grain brown rice, lightly surplus from a local restaurant batch...',
    fullDescription: 'Whole grain brown rice, lightly surplus from a local restaurant batch order. Sealed and stored properly. Perfect for healthy meals, fried rice, or as a side dish.',
    category: 'Pantry',
    availableTime: 'Today, 6:00 PM',
    expiration: 'In 3 Days',
    allergens: ['None'],
    location: 'Gaisano Mall, Davao City',
  },
  {
    id: 5,
    name: 'Banana Bunch (6 pcs)',
    price: 80,
    description: 'Ripe bananas, great for smoothies, banana bread, or eating fresh...',
    fullDescription: 'A bunch of 6 ripe Cavendish bananas. Perfect ripeness for smoothies, banana bread baking, or just eating fresh. Rescued from a local fruit stand.',
    category: 'Produce',
    availableTime: 'Today, 6:00 PM',
    expiration: 'Tomorrow',
    allergens: ['None'],
    location: 'Bankerohan Public Market, Davao City',
  },
  {
    id: 6,
    name: 'Cheddar Cheese Block',
    price: 250,
    description: 'Sharp cheddar, slightly past peak but excellent for cooking or melting...',
    fullDescription: 'Premium sharp cheddar cheese block, slightly past its peak display date but excellent quality for cooking, melting on burgers, or grating over pasta. Properly refrigerated.',
    category: 'Dairy',
    availableTime: 'Today, 6:00 PM',
    expiration: 'In 2 Days',
    allergens: ['Contains Dairy'],
    location: 'SM Ecoland, Matina Pangi Road, Davao City',
  },
]

const CATEGORIES = ['All Items', 'Produce', 'Bakery', 'Dairy', 'Pantry']

const INITIAL_ORDER: OrderItem[] = [
  { id: 1, name: 'Sourdough Bread Loaf', price: 300, qty: 1 },
  { id: 2, name: 'Mixed Vegetable Box', price: 150, qty: 1 },
]



export default function ListingsFeed() {
  const [activeCategory, setActiveCategory] = useState('All Items')
  const [orderItems, setOrderItems] = useState<OrderItem[]>(INITIAL_ORDER)
  const [paymentMethod, setPaymentMethod] = useState('GCash')
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [activeTab, setActiveTab] = useState<'listings' | 'history' | 'profile'>('profile')

  // Mock impact stats — will be replaced by backend data
  const [impactStats] = useState<ImpactStats>({
    foodSaved: 67,
    carbonReduced: 32,
    peopleFed: 40,
    pointsEarned: 67,
  })

  const filtered =
    activeCategory === 'All Items'
      ? LISTINGS
      : LISTINGS.filter((l) => l.category === activeCategory)

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const total = subtotal

  // Derive unique pickup locations from order items
  const pickupLocations = Array.from(
    new Set(
      orderItems
        .map((item) => {
          const listing = LISTINGS.find((l) => l.id === item.id)
          return listing?.location ?? ''
        })
        .filter(Boolean)
    )
  )

  const addToOrder = (listing: { id: number; name: string; price: number }, qty = 1) => {
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

  const addFromDetail = (listing: FoodListingFull, qty: number) => {
    addToOrder(listing, qty)
  }

  const removeFromOrder = (id: number) => {
    setOrderItems((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <div className="listings-page">
      {/* Navbar */}
      <div className="navbar-wrapper">
        <nav className="navbar">
          <div className="navbar-left">
            <span className="brand">Sureplus</span>
            <a href="#" className={`nav-link ${activeTab === 'listings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('listings') }}>Listings</a>
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
          <ProfileView />
        ) : activeTab === 'history' ? (
          <HistoryView />
        ) : (
          <div className="listings-content">
            {selectedListing ? (
              <ProductDetail
                listing={selectedListing as FoodListingFull}
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
                  {filtered.map((listing) => (
                    <div
                      key={listing.id}
                      className="listing-card"
                      onClick={() => setSelectedListing(listing)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Placeholder image */}
                      <div className="listing-img-placeholder" aria-label={`Image for ${listing.name}`}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="placeholder-label">Add photo</span>
                      </div>

                      <div className="listing-info">
                        <div className="listing-header">
                          <span className="listing-name">{listing.name}</span>
                          <span className="listing-price">₱{listing.price}.00</span>
                        </div>
                        <p className="listing-desc">{listing.description}</p>

                        <div className="listing-meta">
                          <div className="meta-row">
                            <span className="icon-placeholder" style={{ width: 11, height: 12, background: '#707973' }} />
                            <span>Available: {listing.availableTime}</span>
                          </div>
                          <div className="meta-row expiry">
                            <span className="icon-placeholder" style={{ width: 11, height: 12, background: '#BA1A1A' }} />
                            <span>Expiration: {listing.expiration}</span>
                          </div>
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
                  Rescuing from {new Set(orderItems.map(o => o.id)).size} store{orderItems.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="order-items">
                {orderItems.length === 0 ? (
                  <p className="order-empty">No items in your order yet.</p>
                ) : (
                  orderItems.map((item) => (
                    <div key={item.id} className="order-item">
                      {/* Placeholder thumbnail */}
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
                        <span className="icon-placeholder" style={{ width: 12, height: 14, background: '#707973' }} />
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
                {pickupLocations.length > 0 && (
                  <div className="pickup-locations">
                    <div className="pickup-label-row">
                      <span className="icon-placeholder" style={{ width: 12, height: 14, background: '#0F5238' }} />
                      <span className="pickup-label">Pickup Location{pickupLocations.length > 1 ? 's' : ''}</span>
                    </div>
                    {pickupLocations.map((loc) => (
                      <span key={loc} className="pickup-address">{loc}</span>
                    ))}
                  </div>
                )}
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
                onClick={() => {
                  setShowSuccess(true)
                }}
              >
                <span>Confirm Order</span>
                <span className="icon-placeholder" style={{ width: 13, height: 13, background: 'white' }} />
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
