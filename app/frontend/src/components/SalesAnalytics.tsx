import { useState, useEffect } from 'react';

import './SalesAnalytics.css';
import { purchasesAPI, purchaseAPI, socialImpactAPI } from '../api/apis';

interface SalesAnalyticsProps {
  onBack: () => void;
  sellerId?: string;
}

interface Purchase {
  purchaseID: string;
  totalPrice: number;
  status: string;
  purchaseDate?: string;
}

interface ImpactSummary {
  totalCarbonOffset: number;
  totalRescuedKilos: number;
  totalPeopleFed: number;
  purchaseCount: number;
}

interface Order {
  purchaseID: string;
  buyerName: string;
  foodName: string;
  quantity: number;
  totalPerItem: number;
  status: string;
  purchaseDate?: string;
}

type ChartBar = { label: string; value: number };

function buildWeeklyData(purchases: Purchase[]): ChartBar[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const value = purchases
      .filter(p => p.status === 'completed' && p.purchaseDate?.slice(0, 10) === dateStr)
      .reduce((sum, p) => sum + Number(p.totalPrice), 0);
    return { label, value };
  });
}

function buildMonthlyData(purchases: Purchase[]): ChartBar[] {
  const today = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    const label = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
    const value = purchases
      .filter(p => {
        if (p.status !== 'completed' || !p.purchaseDate) return false;
        const pd = new Date(p.purchaseDate);
        return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
      })
      .reduce((sum, p) => sum + Number(p.totalPrice), 0);
    return { label, value };
  });
}

function formatImpactValue(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(2)} t` : `${kg.toFixed(2)} kg`;
}


export default function SalesAnalytics({ onBack, sellerId }: SalesAnalyticsProps) {
  const [chartView, setChartView] = useState<'Week' | 'Month'>('Week');

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const handleCompleteOrder = async (purchaseID: string) => {
  try {
    await purchaseAPI.completePurchase(purchaseID);

    // update local state
    setOrders(prev =>
      prev.map(order =>
        order.purchaseID === purchaseID
          ? { ...order, status: 'completed' }
          : order
      )
    );

    setPurchases(prev =>
      prev.map(p =>
        p.purchaseID === purchaseID
          ? { ...p, status: 'completed' }
          : p
      )
    );

  } catch (error) {
    console.error('Failed to complete order', error);
  }
};

  useEffect(() => {
    if (!sellerId) return;
    setLoadingData(true);
    Promise.allSettled([
      purchasesAPI.getSellerPurchases(sellerId),
      purchasesAPI.getSellerOrders(sellerId),
      socialImpactAPI.getSellerImpactSummary(sellerId),
    ]).then(([purchasesResult, ordersResult, impactResult]) => {
      if (purchasesResult.status === 'fulfilled') setPurchases(purchasesResult.value.data ?? []);
      if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value.data ?? []);
      if (impactResult.status === 'fulfilled') setImpact(impactResult.value.data ?? null);
    }).finally(() => setLoadingData(false));
  }, [sellerId]);

  const chartBars = chartView === 'Week' ? buildWeeklyData(purchases) : buildMonthlyData(purchases);
  const chartMax = Math.max(1, ...chartBars.map(b => b.value));
  const SVG_W = 500, CHART_H = 110, LABEL_Y = 128, PAD_X = 12;
  const barW = Math.floor((SVG_W - PAD_X * 2) / chartBars.length * 0.5);
  const slotW = (SVG_W - PAD_X * 2) / chartBars.length;

  const completedPurchases = purchases.filter((p) => p.status === 'completed');
  const totalSales = completedPurchases.reduce((sum, p) => sum + Number(p.totalPrice), 0);
  const totalTransactions = purchases.length;
  const totalItemsSold = orders.reduce((sum, o) => sum + o.quantity, 0);

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

        {/* Items Sold */}
        <div className="sa-metric-card">
          <div className="sa-metric-header">
            <div className="sa-metric-icon sa-icon-orange">
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12a5 5 0 110-10 5 5 0 010 10z" fill="#EA580C"/><path d="M8 4v4l3 3" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="sa-metric-badge sa-badge-orange">{orders.length} orders</div>
          </div>
          <div className="sa-metric-body">
            <span className="sa-metric-label">ITEMS SOLD</span>
            <span className="sa-metric-value">{loadingData ? '…' : totalItemsSold}</span>
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
              <h3 className="sa-chart-title">{chartView === 'Week' ? 'Daily Revenue (Last 7 Days)' : 'Monthly Revenue (Last 6 Months)'}</h3>
              <p className="sa-chart-desc">Completed orders only</p>
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
            {loadingData ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8', fontSize: 14 }}>Loading chart…</div>
            ) : (
              <svg viewBox={`0 0 ${SVG_W} ${LABEL_Y + 16}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
                {[0.25, 0.5, 0.75, 1].map((f, i) => (
                  <line key={i} x1={PAD_X} y1={CHART_H * (1 - f)} x2={SVG_W - PAD_X} y2={CHART_H * (1 - f)} stroke="#E2E8F0" strokeWidth="1" />
                ))}
                {chartBars.map((bar, i) => {
                  const bh = Math.max(2, (bar.value / chartMax) * CHART_H);
                  const bx = PAD_X + i * slotW + (slotW - barW) / 2;
                  return (
                    <g key={i}>
                      <rect x={bx} y={CHART_H - bh} width={barW} height={bh} rx="4" fill="#66B018" opacity={bar.value > 0 ? 1 : 0.15} />
                      <text x={bx + barW / 2} y={LABEL_Y} textAnchor="middle" fontFamily="Work Sans, sans-serif" fontSize="10" fill="#94A3B8" fontWeight="600">{bar.label}</text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Environmental Impact Card */}
        <div className="sa-impact-card">
          <h3 className="sa-impact-title">Environmental Impact</h3>
          <p className="sa-impact-desc">
            Based on all food rescued through your store's completed orders.
          </p>
          {loadingData ? (
            <p style={{ color: '#94A3B8', fontSize: 14 }}>Loading impact data…</p>
          ) : (
            <div className="sa-impact-metrics">
              {(() => {
                const co2 = impact?.totalCarbonOffset ?? 0;
                const kg  = impact?.totalRescuedKilos  ?? 0;
                const maxImpact = Math.max(1, co2, kg);
                return (
                  <>
                    <div className="sa-impact-metric">
                      <div className="sa-impact-metric-header">
                        <span className="sa-impact-metric-label">CO₂ Emissions Offset</span>
                        <span className="sa-impact-metric-value">{formatImpactValue(co2)}</span>
                      </div>
                      <div className="sa-impact-bar-bg">
                        <div className="sa-impact-bar-fill" style={{ width: `${(co2 / maxImpact) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="sa-impact-metric">
                      <div className="sa-impact-metric-header">
                        <span className="sa-impact-metric-label">Food Rescued</span>
                        <span className="sa-impact-metric-value">{formatImpactValue(kg)}</span>
                      </div>
                      <div className="sa-impact-bar-bg">
                        <div className="sa-impact-bar-fill" style={{ width: `${(kg / maxImpact) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="sa-impact-metric">
                      <div className="sa-impact-metric-header">
                        <span className="sa-impact-metric-label">People Fed</span>
                        <span className="sa-impact-metric-value">{impact?.totalPeopleFed ?? 0}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Orders */}
      <div className="sa-buyers-card">
        <div className="sa-buyers-header">
          <h3 className="sa-buyers-title">Orders</h3>
        </div>

        <div className="sa-buyers-table">
          <div className="sa-buyers-thead">
            <div className="sa-buyers-th sa-buyers-th-product">BUYER</div>
            <div className="sa-buyers-th">ITEM</div>
            <div className="sa-buyers-th">QUAN.</div>
            <div className="sa-buyers-th">TOTAL</div>
            <div className="sa-buyers-th sa-buyers-th-right">STATUS</div>
          </div>

          <div className="sa-buyers-tbody">
            {loadingData ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#707973' }}>Loading orders…</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#707973' }}>No orders found.</div>
            ) : (
              orders.slice(0, 10).map((order, idx) => {
                const statusClass =
                  order.status === 'completed' ? 'sa-loyalty-green' :
                  order.status === 'pending'   ? 'sa-loyalty-amber' :
                  order.status === 'cancelled' ? 'sa-loyalty-red'   : 'sa-loyalty-blue';
                return (
                  <div key={`${order.purchaseID}-${idx}`} className="sa-buyers-row-group">
                    <div className="sa-buyers-row" style={{ cursor: 'default' }}>
                      <div className="sa-buyers-td sa-buyers-th-product">
                        <span className="sa-freq-value">{order.buyerName}</span>
                      </div>
                      <div className="sa-buyers-td">
                        <span className="sa-freq-value">{order.foodName}</span>
                      </div>
                      <div className="sa-buyers-td">
                        <span className="sa-freq-value">{order.quantity}</span>
                      </div>
                      <div className="sa-buyers-td">
                        <span className="sa-freq-value">₱{order.totalPerItem.toFixed(2)}</span>
                      </div>
                      <div className="sa-buyers-td sa-buyers-td-loyalty">
                        {order.status === 'pending' ? (
                          <button
                            className={`sa-loyalty-badge ${statusClass}`}
                            onClick={() => handleCompleteOrder(order.purchaseID)}
                          >
                            MARK COMPLETE
                          </button>
                        ) : (
                          <span className={`sa-loyalty-badge ${statusClass}`}>
                            {order.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="sa-buyers-pagination">
          <span className="sa-buyers-pagination-info">
            Showing {Math.min(orders.length, 10)} of {orders.length} orders
          </span>
        </div>
      </div>
    </div>
  );
}
