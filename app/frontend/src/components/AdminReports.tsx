import React, { useState } from 'react';
import './AdminReports.css';

type Period = 'weekly' | 'monthly';

const CHART_DATA = [
  { label: 'Jun', rescue: 55, revenue: 40 },
  { label: 'Jul', rescue: 70, revenue: 60 },
  { label: 'Aug', rescue: 50, revenue: 45 },
  { label: 'Sep', rescue: 80, revenue: 70 },
  { label: 'Oct', rescue: 90, revenue: 85 },
  { label: 'Nov', rescue: 65, revenue: 75 },
  { label: 'Dec', rescue: 85, revenue: 80 },
];

const BARANGAYS = [
  { name: 'Mintal',      score: '4.8' },
  { name: 'Toril',       score: '4.6' },
  { name: 'Bago Oshiro', score: '4.1' },
];

const TRANSACTIONS = [
  { date: 'Oct 15, 2025', partner: 'Greenacre Market', type: 'Seller',  typeStyle: 'seller',  weight: '42kg', status: 'Completed', statusStyle: 'completed', revenue: '₱2,340.00' },
  { date: 'Oct 15, 2025', partner: 'Solero Delight',   type: 'Seller',  typeStyle: 'seller',  weight: '42kg', status: 'Completed', statusStyle: 'completed', revenue: '₱480.00'   },
  { date: 'Oct 15, 2025', partner: 'Hizon',            type: 'Pending', typeStyle: 'pending', weight: '34kg', status: 'Pending',   statusStyle: 'pending',   revenue: '₱1,390.00' },
];

// SVG chart helpers
const SVG_W = 560, CHART_H = 150, LABEL_Y = 170, PAD_X = 8;
const MAX_VAL = 90, BAR_W = 15, BAR_GAP = 4;

function buildChart() {
  const monthW = (SVG_W - PAD_X * 2) / CHART_DATA.length;
  return CHART_DATA.map((d, i) => {
    const groupW = BAR_W * 2 + BAR_GAP;
    const gx     = PAD_X + i * monthW + (monthW - groupW) / 2;
    const rh     = (d.rescue  / MAX_VAL) * CHART_H;
    const vh     = (d.revenue / MAX_VAL) * CHART_H;
    return {
      label: d.label,
      labelX: PAD_X + i * monthW + monthW / 2,
      rescueBar:  { x: gx,              y: CHART_H - rh, w: BAR_W, h: rh },
      revenueBar: { x: gx + BAR_W + BAR_GAP, y: CHART_H - vh, w: BAR_W, h: vh },
      lineX: gx + BAR_W + BAR_GAP + BAR_W / 2,
      lineY: CHART_H - vh,
    };
  });
}

export default function AdminReports() {
  const [period, setPeriod] = useState<Period>('monthly');
  const pts      = buildChart();
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.lineX},${p.lineY}`).join(' ');
  const guides   = [0.25, 0.5, 0.75, 1];

  return (
    <div className="rp-layout">

      {/* ── Top action bar ── */}
      <div className="rp-topbar">
        <button className="rp-apply-btn">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <line x1="0" y1="1" x2="14" y2="1"/>
            <line x1="2" y1="5" x2="12" y2="5"/>
            <line x1="4" y1="9" x2="10" y2="9"/>
          </svg>
          Apply Filters
        </button>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="rp-stat-grid">

        {/* Earnings */}
        <div className="rp-stat-card">
          <div className="rp-stat-row">
            <div className="rp-stat-icon">
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="#475569" strokeWidth="1.8">
                <rect x="1" y="1" width="20" height="14" rx="2"/>
                <circle cx="11" cy="8" r="2.5"/>
              </svg>
            </div>
            <span className="rp-badge rp-badge--up">
              <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0z" fill="#0F5238"/></svg>
              +8.4%
            </span>
          </div>
          <p className="rp-stat-name">Earnings</p>
          <p className="rp-stat-val">₱42,890</p>
          <p className="rp-stat-sub">Revenue from surplus sales</p>
        </div>

        {/* Inventory */}
        <div className="rp-stat-card">
          <div className="rp-stat-row">
            <div className="rp-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <span className="rp-badge rp-badge--down">
              <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 5L8 0H0z" fill="#BA1A1A"/></svg>
              -3.1%
            </span>
          </div>
          <p className="rp-stat-name">Inventory</p>
          <p className="rp-stat-val">1,248</p>
          <p className="rp-stat-sub">Active food listings today</p>
        </div>

        {/* Impact (featured) */}
        <div className="rp-stat-card rp-stat-card--featured">
          <div className="rp-stat-row">
            <div className="rp-stat-icon rp-stat-icon--green">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.17L2 22l3.41-1.68C6 19.5 8 18.43 8 17c0-1.1-.9-2-2-2 0-3 2-5.93 6-6 1.5 0 2.68.39 3.68 1.05A8 8 0 0 1 19 20l1-.01C20 14.12 16.14 9.04 10.73 7.27"/>
              </svg>
            </div>
            <span className="rp-badge rp-badge--up">
              <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0z" fill="#0F5238"/></svg>
              +5.2%
            </span>
          </div>
          <p className="rp-stat-name rp-stat-name--green">Impact</p>
          <p className="rp-stat-val">84.2t</p>
          <p className="rp-stat-sub">CO2 emissions averted</p>
        </div>

        {/* User Growth */}
        <div className="rp-stat-card">
          <div className="rp-stat-row">
            <div className="rp-stat-icon">
              <svg width="22" height="16" viewBox="0 0 26 20" fill="none" stroke="#475569" strokeWidth="2">
                <path d="M18 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="10" cy="7" r="4"/>
                <path d="M24 19v-2a4 4 0 0 0-3-3.87"/>
                <path d="M17 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span className="rp-badge rp-badge--up">
              <svg width="7" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0z" fill="#0F5238"/></svg>
              +2.9%
            </span>
          </div>
          <p className="rp-stat-name">User Growth</p>
          <p className="rp-stat-val">18.2k</p>
          <p className="rp-stat-sub">Active community members</p>
        </div>

      </div>

      {/* ── Bento Grid ── */}
      <div className="rp-bento">

        {/* Large Chart Card */}
        <div className="rp-chart-card">
          <div className="rp-chart-header">
            <div>
              <h3 className="rp-chart-title">Impact & Revenue Trends</h3>
              <p className="rp-chart-sub">Comparison of environmental impact vs marketplace revenue</p>
            </div>
            <div className="rp-period-toggle">
              <button
                className={`rp-period-btn ${period === 'weekly' ? 'rp-period-btn--active' : ''}`}
                onClick={() => setPeriod('weekly')}
              >Weekly</button>
              <button
                className={`rp-period-btn ${period === 'monthly' ? 'rp-period-btn--active' : ''}`}
                onClick={() => setPeriod('monthly')}
              >Monthly</button>
            </div>
          </div>

          <div className="rp-chart-area">
            <svg
              viewBox={`0 0 ${SVG_W} 185`}
              width="100%" height="220"
              preserveAspectRatio="none"
            >
              {/* Guide lines */}
              {guides.map((f, i) => (
                <line key={i}
                  x1={PAD_X} y1={CHART_H * (1 - f)}
                  x2={SVG_W - PAD_X} y2={CHART_H * (1 - f)}
                  stroke="#E2E8F0" strokeWidth="1"
                />
              ))}

              {/* Rescue bars */}
              {pts.map((p, i) => (
                <rect key={`r${i}`}
                  x={p.rescueBar.x} y={p.rescueBar.y}
                  width={p.rescueBar.w} height={p.rescueBar.h}
                  rx="3" fill="rgba(15,82,56,0.18)"
                />
              ))}

              {/* Revenue bars */}
              {pts.map((p, i) => (
                <rect key={`v${i}`}
                  x={p.revenueBar.x} y={p.revenueBar.y}
                  width={p.revenueBar.w} height={p.revenueBar.h}
                  rx="3" fill="#CBD5E1"
                />
              ))}

              {/* Revenue trend line */}
              <path d={linePath} fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round"/>
              {pts.map((p, i) => (
                <circle key={`d${i}`} cx={p.lineX} cy={p.lineY} r="3.5"
                  fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.8"/>
              ))}

              {/* Month labels */}
              {pts.map((p, i) => (
                <text key={`l${i}`}
                  x={p.labelX} y={LABEL_Y}
                  textAnchor="middle"
                  fontFamily="Work Sans, sans-serif"
                  fontSize="11" fill="#94A3B8" fontWeight="700"
                >{p.label}</text>
              ))}
            </svg>

            {/* Legend overlay */}
            <div className="rp-legend">
              <div className="rp-legend-item">
                <span className="rp-legend-dot" style={{ background: '#0F5238' }}></span>
                FOOD RESCUED
              </div>
              <div className="rp-legend-item">
                <span className="rp-legend-dot" style={{ background: '#94A3B8' }}></span>
                NET REVENUE
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="rp-right-col">

          {/* Impact Milestone */}
          <div className="rp-milestone-card">
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 7 10 16 10 16s10-9 10-16c0-5.52-4.48-10-10-10z" fill="#B1F0CE"/>
              <circle cx="12" cy="12" r="3.5" fill="rgba(0,0,0,0.15)"/>
            </svg>
            <h3 className="rp-milestone-title">Impact Milestone</h3>
            <p className="rp-milestone-text">
              You've reached 85% of your quarterly food rescue target. Keep going!
            </p>
            <div className="rp-progress-track">
              <div className="rp-progress-fill"></div>
            </div>
          </div>

          {/* Top Barangays */}
          <div className="rp-barangay-card">
            <h3 className="rp-barangay-title">Top Performing Barangays</h3>
            <div className="rp-barangay-list">
              {BARANGAYS.map((b, i) => (
                <div className="rp-barangay-item" key={i}>
                  <span className="rp-barangay-name">{b.name}</span>
                  <span className="rp-barangay-score">{b.score}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Transaction Log ── */}
      <div className="rp-txlog">
        <div className="rp-txlog-header">
          <h3 className="rp-txlog-title">Recent Transaction Log</h3>
          <div className="rp-txlog-controls">
            <div className="rp-format-bar">
              <svg width="10" height="12" viewBox="0 0 12 14" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                <rect x="1" y="1" width="10" height="12" rx="1.5"/>
                <line x1="3" y1="4.5" x2="9" y2="4.5"/>
                <line x1="3" y1="7"   x2="9" y2="7"/>
                <line x1="3" y1="9.5" x2="6" y2="9.5"/>
              </svg>
              <span className="rp-format-label">PDF</span>
              <span className="rp-format-divider"></span>
              <span className="rp-format-label">CSV</span>
            </div>
            <button className="rp-export-btn">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1,1 5,5 9,1"/>
              </svg>
              Export All
            </button>
          </div>
        </div>

        <table className="rp-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>PARTNER</th>
              <th>TYPE</th>
              <th>WEIGHT</th>
              <th>STATUS</th>
              <th>REVENUE</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((tx, i) => (
              <tr key={i}>
                <td className="rp-td-muted">{tx.date}</td>
                <td className="rp-td-bold">{tx.partner}</td>
                <td>
                  <span className={`rp-type-badge rp-type-badge--${tx.typeStyle}`}>{tx.type}</span>
                </td>
                <td className="rp-td-muted">{tx.weight}</td>
                <td>
                  <span className={`rp-status rp-status--${tx.statusStyle}`}>{tx.status}</span>
                </td>
                <td className="rp-td-revenue">{tx.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="rp-txlog-footer">
          <span className="rp-txlog-count">Showing 3 of 248 transactions</span>
          <div className="rp-pg-controls">
            <button className="rp-pg-btn">Previous</button>
            <button className="rp-pg-btn rp-pg-btn--active">1</button>
            <button className="rp-pg-btn">2</button>
            <button className="rp-pg-btn">3</button>
            <button className="rp-pg-btn">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
