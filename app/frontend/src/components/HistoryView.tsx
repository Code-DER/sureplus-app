import { useState, useEffect } from 'react'
import './HistoryView.css'
import { socialImpactAPI, purchaseAPI, ratingsAPI } from '../api/apis'

interface PurchasedItem {
  id: string
  name: string
  details: string
  price: number
  picture: string | null
}

interface OrderHistory {
  id: string
  orderNumber: string
  dateStr: string
  storeName: string
  location: string
  rating: number
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED'
  total: number
  savings: number
  co2: number
  paymentMethod: string
  items: PurchasedItem[]
}

interface SocialImpactRecord {
  impactID: string
  purchaseID: string
  carbonOffset: number
  rescuedKilos: number
  peopleFed: number
}

interface ApiPurchaseItem {
  foodID: string
  foodName: string
  picture: string | null
  quantity: number
  price: number
  totalPerItem: number
}

interface ApiPurchase {
  purchaseID: string
  purchaseDate: string | null
  storeName: string
  paymentMethod: string
  totalPrice: number
  status: string
  items: ApiPurchaseItem[]
}

function formatPurchaseDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown Date'
  return new Date(dateStr)
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    .toUpperCase()
}

function mapToOrderHistory(p: ApiPurchase): OrderHistory {
  const statusMap: Record<string, OrderHistory['status']> = {
    completed: 'COMPLETED',
    pending: 'PENDING',
    cancelled: 'CANCELLED',
  }
  return {
    id: p.purchaseID,
    orderNumber: `SP-${p.purchaseID.slice(-5).toUpperCase()}`,
    dateStr: formatPurchaseDate(p.purchaseDate),
    storeName: p.storeName,
    location: '',
    rating: 0,
    status: statusMap[p.status] ?? 'PENDING',
    total: p.totalPrice,
    savings: 0,
    co2: 0,
    paymentMethod: p.paymentMethod || 'N/A',
    items: p.items.map((item, idx) => ({
      id: `${p.purchaseID}-${idx}`,
      name: item.foodName,
      picture: item.picture,
      details: `Qty: ${item.quantity}`,
      price: item.totalPerItem,
    })),
  }
}

export default function HistoryView() {
  const [orders, setOrders] = useState<OrderHistory[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchaseImpacts, setPurchaseImpacts] = useState<Record<string, SocialImpactRecord>>({})
  const [reviewRating, setReviewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  useEffect(() => {
    purchaseAPI.getBuyerOrders()
      .then(res => {
        const mapped = (res.data as ApiPurchase[]).map(mapToOrderHistory)
        setOrders(mapped)
        if (mapped.length > 0) setSelectedOrder(mapped[0])
      })
      .catch(err => {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        setError(detail ?? 'Failed to load order history.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSelectOrder = async (order: OrderHistory) => {
    setSelectedOrder(order)
    setReviewRating(0)
    setHoverRating(0)
    if (!purchaseImpacts[order.id]) {
      try {
        const res = await socialImpactAPI.getImpactByPurchase(order.id)
        setPurchaseImpacts(prev => ({ ...prev, [order.id]: res.data }))
      } catch {
        // Impact not yet recorded for this purchase — fail silently
      }
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedOrder) return

    if (selectedOrder.status !== 'COMPLETED') {
      setReviewMessage('Only completed purchases can be reviewed.')
      return
    }

    if (reviewRating < 1) {
      setReviewMessage('Please select a rating.')
      return
    }

    try {
      setSubmittingReview(true)
      setReviewMessage('')

      await ratingsAPI.createRating({
        purchaseID: selectedOrder.id,
        rating: reviewRating,
        comment: `${reviewTitle}\n\n${reviewFeedback}`.trim(),
      })

      setReviewMessage('Review submitted successfully!')

      setReviewTitle('')
      setReviewFeedback('')
      setReviewRating(0)
      setHoverRating(0)

    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail

      setReviewMessage(errorMessage ?? 'Failed to submit review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#707973', fontFamily: 'Work Sans, sans-serif' }}>
        Loading order history...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#BA1A1A', fontFamily: 'Work Sans, sans-serif' }}>
        {error}
      </div>
    )
  }

  if (orders.length === 0 || !selectedOrder) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#707973', fontFamily: 'Work Sans, sans-serif' }}>
        No orders yet. Start shopping to see your order history here!
      </div>
    )
  }

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
          {orders.map((order) => (
            <div
              key={order.id}
              className={`history-card ${selectedOrder.id === order.id ? 'active' : ''}`}
              onClick={() => handleSelectOrder(order)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelectOrder(order)}
              aria-current={selectedOrder.id === order.id ? 'true' : undefined}
            >
              <div className="history-card-top">
                <span className="history-date">{order.dateStr}</span>
                <span className="history-price">₱ {order.total.toFixed(2)}</span>
              </div>
              <h3 className="history-store">{order.storeName}</h3>
              {order.location && (
                <div className="history-loc">
                  <span className="pin-icon">📍</span> {order.location}
                </div>
              )}
              <div className="history-card-bottom">
                <div className="history-rating">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className={i < Math.floor(order.rating) ? 'star filled' : 'star'}>
                      {star}
                    </span>
                  ))}
                  {order.rating > 0 && <span className="rating-val">{order.rating.toFixed(1)}</span>}
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
            <span className="stat-val status-delivered">{selectedOrder.status}</span>
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
            <span className="stat-val co2-val">
              {purchaseImpacts[selectedOrder.id]?.carbonOffset.toFixed(2) ?? selectedOrder.co2} kg
            </span>
          </div>
        </div>

        <div className="history-items-section">
          <h3>Purchased Items</h3>
          <div className="history-items-list">
            {selectedOrder.items.length > 0 ? selectedOrder.items.map((item) => (
              <div key={item.id} className="history-item-row">
                <div className="item-img-placeholder">
                  {item.picture && (
                    <img
                      src={item.picture}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                </div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>{item.details}</p>
                </div>
                <div className="item-price">
                  ₱ {item.price.toFixed(2)}
                </div>
              </div>
            )) : (
              <div className="history-item-row"><p>No item details available.</p></div>
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
                  onClick={() => {
                    if (selectedOrder.status === 'COMPLETED') {
                      setReviewRating(star)
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="review-form">
              <div className="form-group">
                <label>Review Title</label>
                <input
                  type="text"
                  placeholder="Summary of your experience"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Your Feedback</label>
                <textarea
                  placeholder="Tell us more about the food quality and service..."
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                ></textarea>
              </div>
              <div className="review-actions">
                {reviewMessage && (
                  <p style={{ marginTop: '10px', color: '#707973' }}>
                    {reviewMessage}
                  </p>
                )}
                <button
                  className="btn-submit-review"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || selectedOrder.status !== 'COMPLETED'}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button className="btn-cancel-review">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
