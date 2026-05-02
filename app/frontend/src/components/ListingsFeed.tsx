import { useState } from 'react'
import './ListingsFeed.css'

interface FoodListing {
  id: number
  name: string
  price: number
  description: string
  category: string
  availableTime: string
  expiration: string
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
    category: 'Bakery',
    availableTime: 'Today, 6:00 PM',
    expiration: 'Tomorrow',
  },
  {
    id: 2,
    name: 'Mixed Vegetable Box',
    price: 150,
    description: 'Assorted greens, carrots, and tomatoes. Great for soups or stir-fry...',
    category: 'Produce',
    availableTime: 'Today, 6:00 PM',
    expiration: 'Tomorrow',
  },
  {
    id: 3,
    name: 'Greek Yogurt (500g)',
    price: 100,
    description: 'Creamy, high-protein yogurt near best-by date. Still perfectly fresh...',
    category: 'Dairy',
    availableTime: 'Today, 6:00 PM',
    expiration: 'Tomorrow',
  },
  {
    id: 4,
    name: 'Brown Rice (2kg)',
    price: 200,
    description: 'Whole grain brown rice, lightly surplus from a local restaurant batch...',
    category: 'Pantry',
    availableTime: 'Today, 6:00 PM',
    expiration: 'In 3 Days',
  },
  {
    id: 5,
    name: 'Banana Bunch (6 pcs)',
    price: 80,
    description: 'Ripe bananas, great for smoothies, banana bread, or eating fresh...',
    category: 'Produce',
    availableTime: 'Today, 6:00 PM',
    expiration: 'Tomorrow',
  },
  {
    id: 6,
    name: 'Cheddar Cheese Block',
    price: 250,
    description: 'Sharp cheddar, slightly past peak but excellent for cooking or melting...',
    category: 'Dairy',
    availableTime: 'Today, 6:00 PM',
    expiration: 'In 2 Days',
  },
]

const CATEGORIES = ['All Items', 'Produce', 'Bakery', 'Dairy', 'Pantry']

const INITIAL_ORDER: OrderItem[] = [
  { id: 1, name: 'Sourdough Bread Loaf', price: 300, qty: 1 },
  { id: 2, name: 'Mixed Vegetable Box', price: 150, qty: 1 },
]

const DELIVERY_FEE = 50

export default function ListingsFeed() {
  const [activeCategory, setActiveCategory] = useState('All Items')
  const [orderItems, setOrderItems] = useState<OrderItem[]>(INITIAL_ORDER)
  const [paymentMethod, setPaymentMethod] = useState('GCash')

  const filtered =
    activeCategory === 'All Items'
      ? LISTINGS
      : LISTINGS.filter((l) => l.category === activeCategory)

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const total = subtotal + DELIVERY_FEE

  const addToOrder = (listing: FoodListing) => {
    setOrderItems((prev) => {
      const existing = prev.find((o) => o.id === listing.id)
      if (existing) {
        return prev.map((o) =>
          o.id === listing.id ? { ...o, qty: o.qty + 1 } : o
        )
      }
      return [...prev, { id: listing.id, name: listing.name, price: listing.price, qty: 1 }]
    })
  }

  const removeFromOrder = (id: number) => {
    setOrderItems((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <div className="listings-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="brand">Sureplus</span>
          <a href="#" className="nav-link active">Listings</a>
          <a href="#" className="nav-link">History</a>
        </div>
        <div className="navbar-right">
          <button className="icon-btn" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button className="icon-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
          <div className="avatar" aria-label="User profile" />
        </div>
      </nav>

      {/* Main content */}
      <div className="listings-content">
        {/* Left: Listings panel */}
        <div className="listings-panel">
          <h1 className="listings-title">Listings</h1>
          <p className="listings-subtitle">High-quality surplus food from local favorites at sustainable prices.</p>

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
              <div key={listing.id} className="listing-card">
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
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>Available: {listing.availableTime}</span>
                    </div>
                    <div className="meta-row expiry">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e05c2a" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>Expiration: {listing.expiration}</span>
                    </div>
                  </div>

                  <button className="add-order-btn" onClick={() => addToOrder(listing)}>
                    Add to Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order panel */}
        <div className="order-panel">
          <div className="order-header">
            <div className="order-header-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </div>
            <div>
              <div className="order-title">My order</div>
              <div className="order-subtitle">
                Rescuing from {new Set(orderItems.map(o => o.id)).size} store{orderItems.length !== 1 ? 's' : ''}
              </div>
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
                  <span className="order-item-price">₱{item.price * item.qty}.00</span>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromOrder(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{subtotal}.00</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{DELIVERY_FEE}.00</span>
            </div>
          </div>

          <div className="order-total">
            <span>Total</span>
            <span className="total-amount">₱{total}.00</span>
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

          <button className="confirm-btn">
            Confirm Order →
          </button>
        </div>
      </div>
    </div>
  )
}
