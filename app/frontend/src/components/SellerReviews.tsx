
import './SellerReviews.css';

interface SellerReviewsProps {
  onBack: () => void;
}

const StarSVG = ({ filled = true }) => (
  <svg width="15" height="14" viewBox="0 0 15 14" fill={filled ? "#A04100" : "none"} xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 0L9.8175 4.695L15 5.4525L11.25 9.105L12.135 14.265L7.5 11.8275L2.865 14.265L3.75 9.105L0 5.4525L5.1825 4.695L7.5 0Z" stroke="#A04100" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Qin Shi Huang',
    date: 'April 25, 2026',
    order: 'Order #RE-44921-X',
    initials: 'QH',
    rating: 5,
    text: 'The vegetables were incredibly fresh! I was surprised at the variety in the mystery box. The staff at the pickup point were very friendly and had everything ready to go. Great value for money.',
    badges: ['FRESH PRODUCE', 'FRIENDLY STAFF']
  },
  {
    id: 2,
    name: 'Buddha',
    date: 'October 22, 2025',
    order: 'Order #RE-43882-B',
    initials: 'BU',
    rating: 4,
    text: "Hi. I'm Lynn from Las Vegas. Mowdels. Were hiring new promohtional mowdels to work en Las Vegas, Yuwezay. Are you etin to tweynty one yirs old?",
    badges: ['EASY TO FIND']
  }
];

export default function SellerReviews({ onBack }: SellerReviewsProps) {
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
          <h1>4.8</h1>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarSVG key={star} filled={true} />
            ))}
          </div>
          <p>TOTAL 128 REVIEWS</p>
        </div>
        
        <div className="rating-divider"></div>
        
        <div className="rating-right">
          <div className="metric-bar">
            <div className="metric-header">
              <span>Product Quality</span>
              <span>4.9/5.0</span>
            </div>
            <div className="metric-track">
              <div className="metric-fill" style={{ width: '98%' }}></div>
            </div>
          </div>
          
          <div className="metric-bar">
            <div className="metric-header">
              <span>Accuracy of Description</span>
              <span>4.7/5.0</span>
            </div>
            <div className="metric-track">
              <div className="metric-fill" style={{ width: '94%' }}></div>
            </div>
          </div>
          
          <div className="metric-bar">
            <div className="metric-header">
              <span>Pickup Ease</span>
              <span>4.6/5.0</span>
            </div>
            <div className="metric-track">
              <div className="metric-fill" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews Title */}
      <h2 className="recent-reviews-title">Recent Reviews</h2>

      {/* Reviews List */}
      <div className="reviews-list">
        {MOCK_REVIEWS.map((review) => (
          <div className="review-card" key={review.id}>
            <div className="review-header">
              <div className="review-author">
                <div className="review-avatar-initials">{review.initials}</div>
                <div className="review-author-info">
                  <h3>{review.name}</h3>
                  <span className="review-meta">{review.date} • {review.order}</span>
                </div>
              </div>
              <div className="review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarSVG key={star} filled={star <= review.rating} />
                ))}
              </div>
            </div>
            <div className="review-body">
              <p>{review.text}</p>
            </div>
            <div className="review-badges">
              {review.badges.map((badge, idx) => (
                <span key={idx} className="review-badge">{badge}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="load-more-container">
        <button className="btn-load-more">Load More Reviews</button>
      </div>

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
              <h4>5.0</h4>
              <div className="promo-graphic-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarSVG key={star} filled={true} />
                ))}
              </div>
              <span>TOTAL 128 REVIEWS</span>
            </div>
            <div className="promo-graphic-metrics">
              {[
                { name: 'Product Quality', score: '5.0/5.0' },
                { name: 'Accuracy of Description', score: '5.0/5.0' },
                { name: 'Pickup Ease', score: '5.0/5.0' }
              ].map((metric, idx) => (
                <div className="promo-metric" key={idx}>
                  <div className="promo-metric-header">
                    <span>{metric.name}</span>
                    <span>{metric.score}</span>
                  </div>
                  <div className="promo-metric-track">
                    <div className="promo-metric-fill" style={{ width: '100%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
