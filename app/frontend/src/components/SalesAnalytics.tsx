import { useState, useEffect } from 'react';

import './SalesAnalytics.css';
import { foodAPI, purchasesAPI } from '../api/apis';
import type { FoodItem } from '../types/food';

interface SalesAnalyticsProps {
  onBack: () => void;
  sellerId?: string;
}

interface Purchase {
  purchaseID: string;
  totalPrice: number;
  status: string;
}


export default function SalesAnalytics({ onBack, sellerId }: SalesAnalyticsProps) {
  const [chartView, setChartView] = useState<'Week' | 'Month'>('Week');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [listings, setListings] = useState<FoodItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!sellerId) return;
    setLoadingData(true);
    Promise.allSettled([
      purchasesAPI.getSellerPurchases(sellerId),
      foodAPI.list({ seller_id: sellerId, include_expired: true }),
    ]).then(([purchasesResult, listingsResult]) => {
      if (purchasesResult.status === 'fulfilled') setPurchases(purchasesResult.value.data ?? []);
      if (listingsResult.status === 'fulfilled') setListings(listingsResult.value.data ?? []);
    }).finally(() => setLoadingData(false));
  }, [sellerId]);

  const completedPurchases = purchases.filter((p) => p.status === 'completed');
  const totalSales = completedPurchases.reduce((sum, p) => sum + Number(p.totalPrice), 0);
  const totalTransactions = purchases.length;

  return (
    <div className="sa-page">
      {/* Header */}
      <div className="sa-header-section">
        <nav className="sa-breadcrumb">
          <button className="sa-breadcrumb-link" onClick={onBack}>Dashboard</button>
          <svg className="sa-breadcrumb-sep" width="5" height="8" viewBox="0 0 5 8" fill="none"><path d="M1 1l3 3-3 3" stroke="#66B018" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="sa-breadcrumb-current">Sales Report</span>
        </nav>
        <h1 className="sa-title">Sales Analytics</h1>
        <p className="sa-subtitle">
          Track your revenue impact and inventory turnover. See how your surplus food rescues are contributing to a zero-waste future.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="sa-metrics-row">
        {/* Total Sales */}
        <div className="sa-metric-card">
          <div className="sa-metric-header">
            <div className="sa-metric-icon sa-icon-green">
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none"><path d="M1 8h3l3-7 4 14 3-7h3" stroke="#66B018" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="sa-metric-badge sa-badge-green">{completedPurchases.length} completed</div>
          </div>
          <div className="sa-metric-body">
            <span className="sa-metric-label">TOTAL SALES</span>
            <span className="sa-metric-value">{loadingData ? '…' : `₱${totalSales.toFixed(2)}`}</span>
          </div>
        </div>

        {/* Active Listings */}
        <div className="sa-metric-card">
          <div className="sa-metric-header">
            <div className="sa-metric-icon sa-icon-orange">
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12a5 5 0 110-10 5 5 0 010 10z" fill="#EA580C"/><path d="M8 4v4l3 3" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="sa-metric-badge sa-badge-orange">{listings.filter(l => l.stockQuantity > 0).length} active</div>
          </div>
          <div className="sa-metric-body">
            <span className="sa-metric-label">TOTAL LISTINGS</span>
            <span className="sa-metric-value">{loadingData ? '…' : listings.length}</span>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="sa-metric-card">
          <div className="sa-metric-header">
            <div className="sa-metric-icon sa-icon-teal">
              <svg width="22" height="19" viewBox="0 0 22 19" fill="none"><path d="M1 5l3-4h14l3 4v12a2 2 0 01-2 2H3a2 2 0 01-2-2V5zm0 0h20M6 9v2a5 5 0 0010 0V9" stroke="#005050" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="sa-metric-badge sa-badge-teal">{completedPurchases.length} completed</div>
          </div>
          <div className="sa-metric-body">
            <span className="sa-metric-label">TOTAL ORDERS</span>
            <span className="sa-metric-value">{loadingData ? '…' : totalTransactions}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Chart & Impact */}
      <div className="sa-middle-row">
        {/* Chart Card */}
        <div className="sa-chart-card">
          <div className="sa-chart-header">
            <div className="sa-chart-title-group">
              <h3 className="sa-chart-title">Weekly Revenue Growth</h3>
              <p className="sa-chart-desc">Comparison between last 7 days vs previous period</p>
            </div>
            <div className="sa-chart-toggle">
              <button 
                className={`sa-toggle-btn ${chartView === 'Week' ? 'active' : ''}`}
                onClick={() => setChartView('Week')}
              >
                Week
              </button>
              <button 
                className={`sa-toggle-btn ${chartView === 'Month' ? 'active' : ''}`}
                onClick={() => setChartView('Month')}
              >
                Month
              </button>
            </div>
          </div>
          <div className="sa-chart-area">
            {/* Grid Lines */}
            <div className="sa-chart-grid">
              <div className="sa-grid-line"></div>
              <div className="sa-grid-line"></div>
              <div className="sa-grid-line"></div>
              <div className="sa-grid-line"></div>
              <div className="sa-grid-line"></div>
            </div>
            {/* X-Axis */}
            <div className="sa-chart-xaxis">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>
            {/* Placeholder for actual bars/lines */}
            <div className="sa-chart-bars">
              {/* Dummy bars for visual representation could go here */}
            </div>
          </div>
        </div>

        {/* Environmental Impact Card */}
        <div className="sa-impact-card">
          <h3 className="sa-impact-title">Environmental Impact</h3>
          <p className="sa-impact-desc">
            Your store has diverted significant organic waste from landfills this month.
          </p>
          <div className="sa-impact-metrics">
            <div className="sa-impact-metric">
              <div className="sa-impact-metric-header">
                <span className="sa-impact-metric-label">CO2 Emissions Saved</span>
                <span className="sa-impact-metric-value">2.4 Tons</span>
              </div>
              <div className="sa-impact-bar-bg">
                <div className="sa-impact-bar-fill" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="sa-impact-metric">
              <div className="sa-impact-metric-header">
                <span className="sa-impact-metric-label">Water Usage Offset</span>
                <span className="sa-impact-metric-value">450k Liters</span>
              </div>
              <div className="sa-impact-bar-bg">
                <div className="sa-impact-bar-fill" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Listings Overview */}
      <div className="sa-buyers-card">
        <div className="sa-buyers-header">
          <h3 className="sa-buyers-title">Your Listings</h3>
        </div>

        <div className="sa-buyers-table">
          <div className="sa-buyers-thead">
            <div className="sa-buyers-th sa-buyers-th-product">PRODUCT</div>
            <div className="sa-buyers-th">PRICE</div>
            <div className="sa-buyers-th">STOCK</div>
            <div className="sa-buyers-th">EXPIRY</div>
            <div className="sa-buyers-th sa-buyers-th-right">STATUS</div>
          </div>

          <div className="sa-buyers-tbody">
            {loadingData ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#707973' }}>Loading listings…</div>
            ) : listings.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#707973' }}>No listings found.</div>
            ) : (
              listings.slice(0, 10).map((item) => {
                const isExpanded = expandedProduct === item.foodID;
                const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();
                const status = item.stockQuantity === 0 ? 'SOLD OUT' : isExpired ? 'EXPIRED' : 'ACTIVE';
                const statusColor = item.stockQuantity === 0 ? 'sa-loyalty-blue' : isExpired ? 'sa-loyalty-blue' : 'sa-loyalty-green';
                return (
                  <div key={item.foodID} className="sa-buyers-row-group">
                    <div
                      className={`sa-buyers-row ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => setExpandedProduct(isExpanded ? null : item.foodID)}
                    >
                      <div className="sa-buyers-td sa-buyers-td-product">
                        <button className={`sa-expand-btn ${isExpanded ? 'open' : ''}`} aria-label="Toggle">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <div className="sa-product-thumb">
                          {item.picture ? (
                            <img src={item.picture} alt={item.foodName} className="sa-product-icon" width="28" height="28" style={{ objectFit: 'cover', borderRadius: 4 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, background: '#E8F0ED', borderRadius: 4 }} />
                          )}
                        </div>
                        <div className="sa-product-info">
                          <span className="sa-product-name">{item.foodName}</span>
                          <span className="sa-product-id">ID: {item.foodID.substring(0, 8).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="sa-buyers-td">
                        <span className="sa-freq-value">₱{Number(item.price).toFixed(2)}</span>
                      </div>

                      <div className="sa-buyers-td">
                        <span className="sa-freq-value">{item.stockQuantity} units</span>
                      </div>

                      <div className="sa-buyers-td">
                        <span className="sa-freq-value">
                          {item.expirationDate
                            ? new Date(item.expirationDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                            : '—'}
                        </span>
                      </div>

                      <div className="sa-buyers-td sa-buyers-td-loyalty">
                        <span className={`sa-loyalty-badge ${statusColor}`}>{status}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="sa-buyers-subtable-wrapper">
                        <div className="sa-buyers-subtable-border" style={{ padding: '12px 24px', fontSize: 13, color: '#404943' }}>
                          <p style={{ margin: 0 }}><strong>Description:</strong> {item.description ?? 'No description.'}</p>
                          {item.allergens.length > 0 && (
                            <p style={{ margin: '6px 0 0' }}>
                              <strong>Allergens:</strong> {item.allergens.map((a) => a.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="sa-buyers-pagination">
          <span className="sa-buyers-pagination-info">
            Showing {Math.min(listings.length, 10)} of {listings.length} listings
          </span>
        </div>
      </div>
    </div>
  );
}
