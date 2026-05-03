import React, { useState } from 'react';
import './SalesAnalytics.css';

interface SalesAnalyticsProps {
  onBack: () => void;
}

const TOP_LISTINGS = [
  {
    id: '#SR-9021',
    name: 'Organic Veggie Box',
    rescues: 142,
    revenue: '₱2,840',
    status: 'HIGH DEMAND',
    score: 4.9,
    image: '🥗', // Placeholder
  },
  {
    id: '#SR-8842',
    name: 'Artisan Bakery Bundle',
    rescues: 98,
    revenue: '₱2,840',
    status: 'STABLE',
    score: 4.9,
    image: '🍞', // Placeholder
  },
];

export default function SalesAnalytics({ onBack }: SalesAnalyticsProps) {
  const [chartView, setChartView] = useState<'Week' | 'Month'>('Week');

  return (
    <div className="sa-page">
      {/* Header */}
      <div className="sa-header-section">
        <nav className="sa-breadcrumb">
          <button className="sa-breadcrumb-link" onClick={onBack}>Dashboard</button>
          <svg className="sa-breadcrumb-sep" width="5" height="8" viewBox="0 0 5 8" fill="none"><path d="M1 1l3 3-3 3" stroke="#0F5238" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none"><path d="M1 8h3l3-7 4 14 3-7h3" stroke="#0F5238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="sa-metric-badge sa-badge-green">+12.5%</div>
          </div>
          <div className="sa-metric-body">
            <span className="sa-metric-label">TOTAL SALES (MTD)</span>
            <span className="sa-metric-value">₱12,450.80</span>
          </div>
        </div>

        {/* Food Waste Rescued */}
        <div className="sa-metric-card">
          <div className="sa-metric-header">
            <div className="sa-metric-icon sa-icon-orange">
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12a5 5 0 110-10 5 5 0 010 10z" fill="#EA580C"/><path d="M8 4v4l3 3" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="sa-metric-badge sa-badge-orange">Top 5%</div>
          </div>
          <div className="sa-metric-body">
            <span className="sa-metric-label">FOOD WASTE RESCUED</span>
            <span className="sa-metric-value">1,240 kg</span>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="sa-metric-card">
          <div className="sa-metric-header">
            <div className="sa-metric-icon sa-icon-teal">
              <svg width="22" height="19" viewBox="0 0 22 19" fill="none"><path d="M1 5l3-4h14l3 4v12a2 2 0 01-2 2H3a2 2 0 01-2-2V5zm0 0h20M6 9v2a5 5 0 0010 0V9" stroke="#005050" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="sa-metric-badge sa-badge-teal">48 active</div>
          </div>
          <div className="sa-metric-body">
            <span className="sa-metric-label">TOTAL TRANSACTIONS</span>
            <span className="sa-metric-value">892</span>
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

      {/* Bottom Row: Top Performing Listings */}
      <div className="sa-table-card">
        <div className="sa-table-header">
          <h3 className="sa-table-title">Top Performing Listings</h3>
          <button className="sa-table-view-all">View All Analytics</button>
        </div>
        
        <div className="sa-table-container">
          <div className="sa-table-head">
            <div className="sa-th">LISTING</div>
            <div className="sa-th sa-th-center">RESCUES</div>
            <div className="sa-th sa-th-center">REVENUE</div>
            <div className="sa-th sa-th-center">STATUS</div>
            <div className="sa-th sa-th-center">SCORE</div>
          </div>
          <div className="sa-table-body">
            {TOP_LISTINGS.map((listing, index) => (
              <div className="sa-table-row" key={index}>
                <div className="sa-td sa-td-listing">
                  <div className="sa-listing-thumb">
                    <span className="sa-listing-emoji">{listing.image}</span>
                  </div>
                  <div className="sa-listing-info">
                    <span className="sa-listing-name">{listing.name}</span>
                    <span className="sa-listing-id">ID: {listing.id}</span>
                  </div>
                </div>
                <div className="sa-td sa-td-center sa-td-rescues">{listing.rescues}</div>
                <div className="sa-td sa-td-center sa-td-revenue">{listing.revenue}</div>
                <div className="sa-td sa-td-center">
                  <span className={`sa-status-badge ${listing.status === 'HIGH DEMAND' ? 'sa-status-high' : 'sa-status-stable'}`}>
                    {listing.status}
                  </span>
                </div>
                <div className="sa-td sa-td-center sa-td-score">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5-2.5-2.5L4.5 4 6 1z" fill="#FB923C"/></svg>
                  <span>{listing.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
