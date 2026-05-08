import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut } from '../api/client'
import type { Purchase, Rating, SocialImpact } from '../types/purchase'
import './HistoryView.css'

export default function HistoryView() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Purchase | null>(null)
  const [impact, setImpact] = useState<SocialImpact | null>(null)
  const [existingRating, setExistingRating] = useState<Rating | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewRating, setReviewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchDetails = async (purchaseID: string) => {
    try {
      setStatusMsg(null)
      const [orderData, impactData] = await Promise.all([
        apiGet<Purchase>(`/purchases/${purchaseID}`),
        apiGet<SocialImpact>(`/social-impact/purchase/${purchaseID}`).catch(() => null)
      ])
      setSelectedOrder(orderData)
      setImpact(impactData)
      
      // Check if already rated
      try {
        const ratingData = await apiGet<Rating>(`/ratings/purchase/${purchaseID}`)
        setExistingRating(ratingData)
        setReviewRating(ratingData.rating)
        setComment(ratingData.comment || '')
      } catch {
        setExistingRating(null)
        setReviewRating(0)
        setComment('')
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err)
    }
  }

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const data = await apiGet<Purchase[]>('/purchases/')
        setPurchases(data)
        if (data.length > 0) {
          fetchDetails(data[0].purchaseID)
        }
      } catch (err) {
        console.error('Failed to fetch purchases:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPurchases()
  }, [])

  const handleSelectOrder = (order: Purchase) => {
    fetchDetails(order.purchaseID)
  }

  const handleSubmitReview = async () => {
    if (!selectedOrder || reviewRating === 0) return
    
    // Get sellerID from first item
    const sellerID = selectedOrder.PurchaseItems?.[0]?.Food?.userID
    if (!sellerID) {
      setStatusMsg({ type: 'error', text: 'Could not determine seller for this purchase.' })
      return
    }

    setSubmitting(true)
    setStatusMsg(null)
    try {
      let rating: Rating;
      if (existingRating) {
        rating = await apiPut<Rating>(`/ratings/${existingRating.ratingID}`, {
          rating: reviewRating,
          comment: comment
        })
        setStatusMsg({ type: 'success', text: 'Review updated successfully!' })
      } else {
        rating = await apiPost<Rating>('/ratings/', {
          purchaseID: selectedOrder.purchaseID,
          sellerID: sellerID,
          rating: reviewRating,
          comment: comment
        })
        setStatusMsg({ type: 'success', text: 'Review submitted successfully!' })
      }
      setExistingRating(rating)
    } catch (err) {
      console.error('Failed to submit review:', err)
      setStatusMsg({ type: 'error', text: 'Failed to submit review.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="history-view"><p>Loading purchases...</p></div>

  return (
    <div className="history-view">
      {/* LEFT SIDEBAR: Purchase List */}
      <div className="history-sidebar">
        <div className="history-sidebar-header">
          <h2>My Purchases</h2>
        </div>

        <div className="history-list">
          {purchases.length === 0 ? (
            <p className="empty-msg">No purchases found.</p>
          ) : purchases.map((order) => (
            <div 
              key={order.purchaseID} 
              className={`history-card ${selectedOrder?.purchaseID === order.purchaseID ? 'active' : ''}`}
              onClick={() => handleSelectOrder(order)}
            >
              <div className="history-card-top">
                <span className="history-date">{new Date(order.purchaseDate).toLocaleDateString()}</span>
                <span className="history-price">₱ {order.totalPrice.toFixed(2)}</span>
              </div>
              <h3 className="history-store">Purchase #{order.purchaseID.slice(0, 8)}</h3>
              <div className="history-card-bottom">
                <div className={`history-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: History Details */}
      {selectedOrder ? (
        <div className="history-detail-panel">
          <div className="history-detail-header">
            <div className="store-icon-large">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M3 6v14a2 2 0 002 2h14a2 2 0 002-2V6H3zm16 14H5V8h14v12zM4 4h16c.55 0 1 .45 1 1v1H3V5c0-.55.45-1 1-1z" />
              </svg>
            </div>
            <div className="store-header-info">
              <h2>History Details</h2>
              <p>Order #{selectedOrder.purchaseID.slice(0, 8)} • {new Date(selectedOrder.purchaseDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="history-stats-bar">
            <div className="stat-col">
              <label>STATUS</label>
              <span className="stat-val status-delivered">{selectedOrder.status}</span>
            </div>
            <div className="stat-col">
              <label>PAYMENT</label>
              <span className="stat-val">{selectedOrder.paymentMethod || 'N/A'}</span>
            </div>
            <div className="stat-col">
              <label>CO2 OFFSET</label>
              <span className="stat-val co2-val">{impact?.carbonOffset.toFixed(2) || '0.00'} kg</span>
            </div>
            <div className="stat-col">
              <label>RESCUED</label>
              <span className="stat-val savings-val">{impact?.rescuedKilos.toFixed(2) || '0.00'} kg</span>
            </div>
          </div>

          <div className="history-items-section">
            <h3>Purchased Items</h3>
            <div className="history-items-list">
              {selectedOrder.PurchaseItems && selectedOrder.PurchaseItems.length > 0 ? selectedOrder.PurchaseItems.map((item, idx) => (
                <div key={idx} className="history-item-row">
                  <div className="item-img-placeholder">
                    {item.Food?.picture && <img src={item.Food.picture} alt={item.Food.foodName} />}
                  </div>
                  <div className="item-info">
                    <h4>{item.Food?.foodName || 'Unknown Item'}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₱ {item.totalPerItem.toFixed(2)}
                  </div>
                </div>
              )) : (
                <div className="history-item-row"><p>No items details available.</p></div>
              )}
            </div>
          </div>

          <div className="history-total-row">
            <span>Total</span>
            <span className="history-total-price">₱ {selectedOrder.totalPrice.toFixed(2)}</span>
          </div>

          <div className="history-review-section">
            <div className="review-box">
              <h3>{existingRating ? 'Edit your review' : 'Rate and review'}</h3>
              
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
                  <label>Your Feedback</label>
                  <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Tell us more about the food quality and service..." 
                    rows={3}
                  ></textarea>
                </div>
                
                {statusMsg && (
                  <div className={`status-message ${statusMsg.type}`}>
                    {statusMsg.text}
                  </div>
                )}

                <div className="review-actions">
                  <button 
                    className="btn-submit-review" 
                    onClick={handleSubmitReview}
                    disabled={submitting || reviewRating === 0}
                  >
                    {submitting ? 'Submitting...' : (existingRating ? 'Update Review' : 'Submit Review')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="history-detail-panel empty">
          <p>Select a purchase to see details.</p>
        </div>
      )}
    </div>
  )
}
