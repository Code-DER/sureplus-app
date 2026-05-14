import { useState } from 'react';

import './SalesAnalytics.css';

import ProduceIcon from '../assets/Seller/Mystery Box/Produce.svg';
import BakeryIcon from '../assets/Seller/Mystery Box/Bakery.svg';

interface SalesAnalyticsProps {
  onBack: () => void;
}

interface Buyer {
  initials: string;
  name: string;
  location: string;
  rescues: number;
  totalWeight: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  topRescuer: { initials: string; name: string };
  frequency: string;
  frequencySub: string;
  rescueContribution: string;
  loyaltyStatus: string;
  loyaltyColor: 'green' | 'blue';
  buyers: Buyer[];
}

const PRODUCTS: Product[] = [
  {
    id: 'BXR-9031',
    name: 'Organic Veggie Box',
    image: ProduceIcon,
    topRescuer: { initials: 'AW', name: 'Alex What' },
    frequency: '9 Rescues',
    frequencySub: 'Avg. weekly',
    rescueContribution: '142 kg',
    loyaltyStatus: 'ECO CHAMPION',
    loyaltyColor: 'green',
    buyers: [
      { initials: 'AW', name: 'Alex What', location: 'Basak, Mintal', rescues: 18, totalWeight: '542 kg' },
      { initials: 'VC', name: 'Vic Calag', location: 'Bago Oshiro', rescues: 9, totalWeight: '31 kg' },
    ],
  },
  {
    id: 'BXR-8842',
    name: 'Artisan Bakery',
    image: BakeryIcon,
    topRescuer: { initials: 'SG', name: 'Sarah G?' },
    frequency: '8 Rescues',
    frequencySub: 'Monthly regular',
    rescueContribution: '98 kg',
    loyaltyStatus: 'RECURRING',
    loyaltyColor: 'blue',
    buyers: [],
  },
];

export default function SalesAnalytics({ onBack }: SalesAnalyticsProps) {
  const [chartView, setChartView] = useState<'Week' | 'Month'>('Week');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(PRODUCTS[0].id);

  const toggleProduct = (id: string) => {
    setExpandedProduct(prev => (prev === id ? null : id));
  };

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

      {/* Bottom Row: Top Buyers by Product */}
      <div className="sa-buyers-card">
        {/* Card Header */}
        <div className="sa-buyers-header">
          <h3 className="sa-buyers-title">Top Buyers by Product</h3>
          <div className="sa-buyers-view-link">
            <span>View All Products</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </div>
        </div>

        {/* Table */}
        <div className="sa-buyers-table">
          {/* Table Header */}
          <div className="sa-buyers-thead">
            <div className="sa-buyers-th sa-buyers-th-product">PRODUCT CATEGORY</div>
            <div className="sa-buyers-th">TOP RESCUER</div>
            <div className="sa-buyers-th">FREQUENCY</div>
            <div className="sa-buyers-th">RESCUE CONTRIBUTION</div>
            <div className="sa-buyers-th sa-buyers-th-right">LOYALTY STATUS</div>
          </div>

          {/* Table Body */}
          <div className="sa-buyers-tbody">
            {PRODUCTS.map((product) => {
              const isExpanded = expandedProduct === product.id;
              return (
                <div key={product.id} className="sa-buyers-row-group">
                  {/* Main Product Row */}
                  <div
                    className={`sa-buyers-row ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleProduct(product.id)}
                  >
                    {/* Toggle Arrow + Product */}
                    <div className="sa-buyers-td sa-buyers-td-product">
                      <button className={`sa-expand-btn ${isExpanded ? 'open' : ''}`} aria-label="Toggle details">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <div className="sa-product-thumb">
                        <img src={product.image} alt={product.name} className="sa-product-icon" width="28" height="28" />
                      </div>
                      <div className="sa-product-info">
                        <span className="sa-product-name">{product.name}</span>
                        <span className="sa-product-id">ID: {product.id}</span>
                      </div>
                    </div>

                    {/* Top Rescuer */}
                    <div className="sa-buyers-td sa-buyers-td-rescuer">
                      <div className="sa-rescuer-avatar">
                        <span>{product.topRescuer.initials}</span>
                      </div>
                      <span className="sa-rescuer-name">{product.topRescuer.name}</span>
                    </div>

                    {/* Frequency */}
                    <div className="sa-buyers-td sa-buyers-td-frequency">
                      <span className="sa-freq-value">{product.frequency}</span>
                      <span className="sa-freq-sub">{product.frequencySub}</span>
                    </div>

                    {/* Rescue Contribution */}
                    <div className="sa-buyers-td sa-buyers-td-contribution">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F5238" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                      <span className="sa-contribution-value">{product.rescueContribution}</span>
                    </div>

                    {/* Loyalty Status */}
                    <div className="sa-buyers-td sa-buyers-td-loyalty">
                      <span className={`sa-loyalty-badge ${product.loyaltyColor === 'green' ? 'sa-loyalty-green' : 'sa-loyalty-blue'}`}>
                        {product.loyaltyStatus}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Sub-table */}
                  {isExpanded && product.buyers.length > 0 && (
                    <div className="sa-buyers-subtable-wrapper">
                      <div className="sa-buyers-subtable-border">
                        <table className="sa-buyers-subtable">
                          <thead>
                            <tr>
                              <th>RESCUER NAME</th>
                              <th>LOCATION</th>
                              <th>RESCUES</th>
                              <th>TOTAL WEIGHT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.buyers.map((buyer, idx) => (
                              <tr key={idx}>
                                <td>
                                  <div className="sa-sub-rescuer">
                                    <div className={`sa-sub-avatar ${idx === 0 ? 'sa-sub-avatar-highlight' : ''}`}>
                                      <span>{buyer.initials}</span>
                                    </div>
                                    <span className="sa-sub-name">{buyer.name}</span>
                                  </div>
                                </td>
                                <td className="sa-sub-location">{buyer.location}</td>
                                <td className="sa-sub-rescues">{buyer.rescues}</td>
                                <td className="sa-sub-weight">{buyer.totalWeight}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        <div className="sa-buyers-pagination">
          <span className="sa-buyers-pagination-info">Showing 1-10 of 42 product categories</span>
          <div className="sa-buyers-pagination-controls">
            <button className="sa-page-btn">
              <svg width="6" height="9" viewBox="0 0 6 9" fill="none"><path d="M5 1L1.5 4.5L5 8" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="sa-page-btn active">1</button>
            <button className="sa-page-btn">2</button>
            <button className="sa-page-btn">3</button>
            <button className="sa-page-btn">
              <svg width="6" height="9" viewBox="0 0 6 9" fill="none"><path d="M1 1L4.5 4.5L1 8" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
