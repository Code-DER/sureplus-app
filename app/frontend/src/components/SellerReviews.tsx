import { useState, useEffect } from 'react';

import './SellerReviews.css';
import { ratingsAPI } from '../api/apis';

interface SellerReviewsProps {
  onBack: () => void;
  sellerId: string;
}

interface Rating {
  ratingID: string;
  purchaseID: string;
  buyerID: string;
  sellerID: string;
  rating: number;
  comment?: string;
}

const StarSVG = ({ filled = true }) => (
  <svg width="15" height="14" viewBox="0 0 15 14" fill={filled ? "#A04100" : "none"} xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 0L9.8175 4.695L15 5.4525L11.25 9.105L12.135 14.265L7.5 11.8275L2.865 14.265L3.75 9.105L0 5.4525L5.1825 4.695L7.5 0Z" stroke="#A04100" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

function shortId(id: string): string {
  return id.substring(0, 6).toUpperCase();
}

export default function SellerReviews({ onBack, sellerId }: SellerReviewsProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    ratingsAPI.getSellerRatings(sellerId)
      .then((res) => setRatings(res.data ?? []))
      .catch(() => setError('Failed to load reviews.'))
      .finally(() => setLoading(false));
  }, [sellerId]);

  const avgRating = ratings.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
  }));

  const visible = ratings.slice(0, visibleCount);

  return (
    <div className="seller-reviews-container">

      {/* Breadcrumb Header */}
      <div className="reviews-breadcrumb">
        <span className="breadcrumb-link" onClick={onBack}>Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Reviews</span>
      </div>

      {/* Overall Rating Card */}
      <div className="overall-rating-card">
        <div className="rating-left">
          {loading ? (
            <h1>—</h1>
          ) : (
            <h1>{ratings.length > 0 ? avgRating.toFixed(1) : '—'}</h1>
          )}
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarSVG key={star} filled={star <= Math.round(avgRating)} />
            ))}
          </div>
          <p>TOTAL {ratings.length} REVIEW{ratings.length !== 1 ? 'S' : ''}</p>
        </div>

        <div className="rating-divider"></div>

        <div className="rating-right">
          {starCounts.map(({ star, count }) => {
            const pct = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
            return (
              <div className="metric-bar" key={star}>
                <div className="metric-header">
                  <span>{star} Star{star !== 1 ? 's' : ''}</span>
                  <span>{count} review{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="metric-track">
                  <div className="metric-fill" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reviews Title */}
      <h2 className="recent-reviews-title">Recent Reviews</h2>

      {/* Loading / Error / Empty */}
      {loading && (
        <p style={{ color: '#707973', fontSize: 14, padding: '16px 0' }}>Loading reviews…</p>
      )}
      {!loading && error && (
        <p style={{ color: '#B71C1C', fontSize: 14, padding: '16px 0' }}>{error}</p>
      )}
      {!loading && !error && ratings.length === 0 && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#707973' }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No reviews yet</p>
          <p style={{ fontSize: 13 }}>Reviews will appear here after buyers complete their orders.</p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && visible.length > 0 && (
        <div className="reviews-list">
          {visible.map((review) => (
            <div className="review-card" key={review.ratingID}>
              <div className="review-header">
                <div className="review-author">
                  <div className="review-avatar-initials">
                    {shortId(review.buyerID).substring(0, 2)}
                  </div>
                  <div className="review-author-info">
                    <h3>Buyer #{shortId(review.buyerID)}</h3>
                    <span className="review-meta">Order #{shortId(review.purchaseID)}</span>
                  </div>
                </div>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarSVG key={star} filled={star <= review.rating} />
                  ))}
                </div>
              </div>
              {review.comment && (
                <div className="review-body">
                  <p>{review.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && visibleCount < ratings.length && (
        <div className="load-more-container">
          <button className="btn-load-more" onClick={() => setVisibleCount((v) => v + 5)}>
            Load More Reviews
          </button>
        </div>
      )}

      {/* Improve Your Rating Banner */}
      <div className="promo-banner">
        <div className="promo-left">
          <h2>Improve Your Rating</h2>
          <p>Sellers with a rating above 4.8 see a 40% increase in Mystery Box sales. Check out our guide on pickup optimization.</p>
          <button className="btn-read-guide">Read Guide</button>
        </div>

        <div className="promo-right-graphic">
          <div className="promo-graphic-header">
            <h3>Customer Reviews</h3>
            <p>Manage your reputation and learn from buyer feedback.</p>
          </div>
          <div className="promo-graphic-body">
            <div className="promo-graphic-score">
              <h4>{ratings.length > 0 ? avgRating.toFixed(1) : '—'}</h4>
              <div className="promo-graphic-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarSVG key={star} filled={star <= Math.round(avgRating)} />
                ))}
              </div>
              <span>TOTAL {ratings.length} REVIEWS</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
