import { useState } from 'react'
import './HistoryView.css'

interface PurchasedItem {
  id: string
  name: string
  details: string
  price: number
  imagePlaceholder?: boolean
}

interface OrderHistory {
  id: string
  orderNumber: string
  dateStr: string
  storeName: string
  location: string
  rating: number
  status: 'COMPLETED' | 'ARCHIVED'
  total: number
  savings: number
  co2: number
  paymentMethod: string
  items: PurchasedItem[]
}

const MOCK_HISTORY: OrderHistory[] = [
  {
    id: '1',
    orderNumber: 'SP-88294',
    dateStr: 'MAY 02, 2026',
    storeName: 'Kali Market Central',
    location: 'Kalimudan, UP Rd',
    rating: 4.0,
    status: 'COMPLETED',
    total: 120.00,
    savings: 620,
    co2: 2.4,
    paymentMethod: 'Visa ** 4242',
    items: [
      {
        id: 'i1',
        name: 'Roronoa Zoro (Large)',
        details: 'Qty: 1 • Includes organic kale, hotdog, beets',
        price: 300.00,
      },
      {
        id: 'i2',
        name: 'Gojo Satoru',
        details: 'Qty: 1 • Day-end surplus, perfect for toasting',
        price: 150.00,
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'SP-88293',
    dateStr: 'MAY 01, 2026',
    storeName: 'CSM Bakery & Co.',
    location: 'UP Mindanao, Tugbok',
    rating: 5.0,
    status: 'ARCHIVED',
    total: 85.60,
    savings: 200,
    co2: 1.1,
    paymentMethod: 'GCash',
    items: []
  },
  {
    id: '3',
    orderNumber: 'SP-88290',
    dateStr: 'APR 29, 2026',
    storeName: 'Namanok Chicken',
    location: 'Davao-Bukidnon Rd',
    rating: 3.0,
    status: 'COMPLETED',
    total: 620.80,
    savings: 150,
    co2: 0.8,
    paymentMethod: 'Cash',
    items: []
  }
]

export default function HistoryView() {
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory>(MOCK_HISTORY[0])
  const [reviewRating, setReviewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="history-view">
      {/* LEFT SIDEBAR: Purchase List */}
      <div className="history-sidebar">
        <div className="history-sidebar-header">
          <h2>My Purchases</h2>
          <button className="icon-btn-outline" aria-label="Filter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="history-list">
          {MOCK_HISTORY.map((order) => (
            <div 
              key={order.id} 
              className={`history-card ${selectedOrder.id === order.id ? 'active' : ''}`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="history-card-top">
                <span className="history-date">{order.dateStr}</span>
                <span className="history-price">₱ {order.total.toFixed(2)}</span>
              </div>
              <h3 className="history-store">{order.storeName}</h3>
              <div className="history-loc">
                <span className="pin-icon">📍</span> {order.location}
              </div>
              <div className="history-card-bottom">
                <div className="history-rating">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className={i < Math.floor(order.rating) ? 'star filled' : 'star'}>
                      {star}
                    </span>
                  ))}
                  <span className="rating-val">{order.rating.toFixed(1)}</span>
                </div>
                <div className={`history-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: History Details */}
      <div className="history-detail-panel">
        <div className="history-detail-header">
          <div className="store-icon-large">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M3 6v14a2 2 0 002 2h14a2 2 0 002-2V6H3zm16 14H5V8h14v12zM4 4h16c.55 0 1 .45 1 1v1H3V5c0-.55.45-1 1-1z" />
            </svg>
          </div>
          <div className="store-header-info">
            <h2>History Details</h2>
            <p>Order #{selectedOrder.orderNumber} • {selectedOrder.dateStr.charAt(0) + selectedOrder.dateStr.slice(1).toLowerCase()}</p>
          </div>
        </div>

        <div className="history-stats-bar">
          <div className="stat-col">
            <label>STATUS</label>
            <span className="stat-val status-delivered">Delivered</span>
          </div>
          <div className="stat-col">
            <label>PAYMENT</label>
            <span className="stat-val">{selectedOrder.paymentMethod}</span>
          </div>
          <div className="stat-col">
            <label>TOTAL SAVINGS</label>
            <span className="stat-val savings-val">₱ {selectedOrder.savings}</span>
          </div>
          <div className="stat-col">
            <label>CO2 OFFSET</label>
            <span className="stat-val co2-val">{selectedOrder.co2} kg</span>
          </div>
        </div>

        <div className="history-items-section">
          <h3>Purchased Items</h3>
          <div className="history-items-list">
            {selectedOrder.items.length > 0 ? selectedOrder.items.map((item) => (
              <div key={item.id} className="history-item-row">
                <div className="item-img-placeholder"></div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>{item.details}</p>
                </div>
                <div className="item-price">
                  ₱ {item.price.toFixed(2)}
                </div>
              </div>
            )) : (
              <div className="history-item-row"><p>No items details available.</p></div>
            )}
          </div>
        </div>

        <div className="history-total-row">
          <span>Total</span>
          <span className="history-total-price">₱ {selectedOrder.total.toFixed(2)}</span>
        </div>

        <div className="history-review-section">
          <div className="review-box">
            <h3>Rate and review</h3>
            <p>How was your experience with {selectedOrder.storeName}?</p>
            
            <div className="review-stars-large" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={star <= (hoverRating || reviewRating) ? 'star filled' : 'star empty'}
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setReviewRating(star)}
                  style={{ cursor: 'pointer' }}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="review-form">
              <div className="form-group">
                <label>Review Title</label>
                <input type="text" placeholder="Summary of your experience" />
              </div>
              <div className="form-group">
                <label>Your Feedback</label>
                <textarea placeholder="Tell us more about the food quality and service..." rows={3}></textarea>
              </div>
              <div className="review-actions">
                <button className="btn-submit-review">Submit Review</button>
                <button className="btn-cancel-review">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
