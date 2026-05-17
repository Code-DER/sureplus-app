import { useEffect, useState } from 'react';
import './AdminReports.css';
import { adminAPI } from '../api/apis';

type Period = 'weekly' | 'monthly';

type Overview = {
  accounting: {
    grossSales: number;
    platformMarkupRate: number;
    platformEarnings: number;
    subscriptionFees: number;
    totalEarnings: number;
  };
  inventory: {
    sold: number;
    donated: number;
    innovator: number;
    composted: number;
  };
};

type Transaction = {
  purchaseID: string;
  totalPrice: number;
  purchaseDate?: string;
  status: string;
  userID: string;
  quantity: number;
};
const TRANSACTIONS_PER_PAGE = 10;

const SVG_W = 560, CHART_H = 150, LABEL_Y = 170, PAD_X = 8;

function buildChart(data: Array<{ label: string; rescue: number; revenue: number }>) {
  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.rescue, d.revenue)));
  const barW = 15;
  const barGap = 4;
  const monthW = (SVG_W - PAD_X * 2) / Math.max(1, data.length);

  return data.map((d, i) => {
    const groupW = barW * 2 + barGap;
    const gx = PAD_X + i * monthW + (monthW - groupW) / 2;
    const rh = (d.rescue / maxVal) * CHART_H;
    const vh = (d.revenue / maxVal) * CHART_H;
    return {
      label: d.label,
      labelX: PAD_X + i * monthW + monthW / 2,
      rescueBar: { x: gx, y: CHART_H - rh, w: barW, h: rh },
      revenueBar: { x: gx + barW + barGap, y: CHART_H - vh, w: barW, h: vh },
      lineX: gx + barW + barGap + barW / 2,
      lineY: CHART_H - vh,
    };
  });
}

const formatCurrency = (value: number) =>
  `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminReports() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const overviewRes = await adminAPI.getReportsOverview();
        setOverview(overviewRes.data ?? null);
      } finally {
        setLoading(false);
      }
    };
    void loadOverview();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const txRes = await adminAPI.getRecentTransactions(TRANSACTIONS_PER_PAGE, currentPage);
        setTransactions(txRes.data?.transactions ?? []);
        setTotalTransactions(txRes.data?.total ?? 0);
      } finally {
        setLoading(false);
      }
    };
    void loadTransactions();
  }, [currentPage]);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.rp-export-menu-wrap')) return;
      setShowExportMenu(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE));
  const pageStart = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const goTo = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const toCsvCell = (value: string | number) => {
    const str = String(value ?? '');
    const escaped = str.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const formatTxDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '-');

  const exportAllCsv = async () => {
    try {
      const allRows: Transaction[] = [];
      let page = 1;
      let totalPagesForExport = 1;
      do {
        const res = await adminAPI.getRecentTransactions(100, page);
        const rows: Transaction[] = res.data?.transactions ?? [];
        const total: number = res.data?.total ?? 0;
        totalPagesForExport = Math.max(1, Math.ceil(total / 100));
        allRows.push(...rows);
        page += 1;
      } while (page <= totalPagesForExport);

      const headers = ['DATE', 'PARTNER', 'TYPE', 'WEIGHT', 'STATUS', 'REVENUE'];
      const lines = [
        headers.join(','),
        ...allRows.map((tx) => ([
          toCsvCell(formatTxDate(tx.purchaseDate)),
          toCsvCell(`User ${tx.userID}`),
          toCsvCell('Seller'),
          toCsvCell(`${tx.quantity || 0}kg`),
          toCsvCell(tx.status || ''),
          toCsvCell(formatCurrency(tx.totalPrice || 0)),
        ].join(','))),
      ];
      const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recent-transaction-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
      alert('Failed to export CSV.');
    } finally {
      setShowExportMenu(false);
    }
  };

  const exportAllPdf = () => {
    setShowExportMenu(false);
    alert('PDF export is not available yet without additional dependencies. CSV export is ready.');
  };

  const grouped = transactions.reduce<Record<string, { rescue: number; revenue: number }>>((acc, tx) => {
    const key = tx.purchaseDate ? new Date(tx.purchaseDate).toLocaleString('en-US', { month: 'short' }) : 'N/A';
    if (!acc[key]) acc[key] = { rescue: 0, revenue: 0 };
    acc[key].rescue += Number(tx.quantity || 0);
    acc[key].revenue += Number(tx.totalPrice || 0);
    return acc;
  }, {});
  const chartData = Object.entries(grouped)
    .map(([label, values]) => ({ label, rescue: values.rescue, revenue: values.revenue }))
    .slice(-7);
  const pts = buildChart(chartData.length > 0 ? chartData : [{ label: 'N/A', rescue: 0, revenue: 0 }]);
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.lineX},${p.lineY}`).join(' ');
  const guides = [0.25, 0.5, 0.75, 1];

  const activeUsers = new Set(transactions.map((tx) => tx.userID).filter(Boolean)).size;
  const impactValue = overview?.inventory.donated ?? 0;

  return (
    <div className="rp-layout">
      {loading && <p>Loading reports...</p>}

      <div className="rp-topbar">
        <button className="rp-apply-btn">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
            <line x1="0" y1="1" x2="14" y2="1" />
            <line x1="2" y1="5" x2="12" y2="5" />
            <line x1="4" y1="9" x2="10" y2="9" />
          </svg>
          Apply Filters
        </button>
      </div>

      <div className="rp-stat-grid">
        <div className="rp-stat-card">
          <div className="rp-stat-row">
            <div className="rp-stat-icon">
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="#475569" strokeWidth="1.8">
                <rect x="1" y="1" width="20" height="14" rx="2" />
                <circle cx="11" cy="8" r="2.5" />
              </svg>
            </div>
            <span className="rp-badge rp-badge--up">
              <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0z" fill="#66B018" /></svg>
              Live
            </span>
          </div>
          <p className="rp-stat-name">Earnings</p>
          <p className="rp-stat-val">{formatCurrency(overview?.accounting.totalEarnings ?? 0)}</p>
          <p className="rp-stat-sub">Revenue from surplus sales</p>
        </div>

        <div className="rp-stat-card">
          <div className="rp-stat-row">
            <div className="rp-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <span className="rp-badge rp-badge--up">
              <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0z" fill="#66B018" /></svg>
              Live
            </span>
          </div>
          <p className="rp-stat-name">Inventory</p>
          <p className="rp-stat-val">{overview?.inventory.sold ?? 0}</p>
          <p className="rp-stat-sub">Active food listings today</p>
        </div>

        <div className="rp-stat-card rp-stat-card--featured">
          <div className="rp-stat-row">
            <div className="rp-stat-icon rp-stat-icon--green">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.17L2 22l3.41-1.68C6 19.5 8 18.43 8 17c0-1.1-.9-2-2-2 0-3 2-5.93 6-6 1.5 0 2.68.39 3.68 1.05A8 8 0 0 1 19 20l1-.01C20 14.12 16.14 9.04 10.73 7.27" />
              </svg>
            </div>
            <span className="rp-badge rp-badge--up">
              <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0z" fill="#66B018" /></svg>
              Live
            </span>
          </div>
          <p className="rp-stat-name rp-stat-name--green">Impact</p>
          <p className="rp-stat-val">{impactValue || 0}</p>
          <p className="rp-stat-sub">CO2 emissions averted</p>
        </div>

        <div className="rp-stat-card">
          <div className="rp-stat-row">
            <div className="rp-stat-icon">
              <svg width="22" height="16" viewBox="0 0 26 20" fill="none" stroke="#475569" strokeWidth="2">
                <path d="M18 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M24 19v-2a4 4 0 0 0-3-3.87" />
                <path d="M17 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="rp-badge rp-badge--up">
              <svg width="7" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0z" fill="#66B018" /></svg>
              Live
            </span>
          </div>
          <p className="rp-stat-name">User Growth</p>
          <p className="rp-stat-val">{activeUsers || 0}</p>
          <p className="rp-stat-sub">Active community members</p>
        </div>
      </div>

      <div className="rp-bento">
        <div className="rp-chart-card">
          <div className="rp-chart-header">
            <div>
              <h3 className="rp-chart-title">Impact & Revenue Trends</h3>
              <p className="rp-chart-sub">Comparison of environmental impact vs marketplace revenue</p>
            </div>
            <div className="rp-period-toggle">
              <button className={`rp-period-btn ${period === 'weekly' ? 'rp-period-btn--active' : ''}`} onClick={() => setPeriod('weekly')}>Weekly</button>
              <button className={`rp-period-btn ${period === 'monthly' ? 'rp-period-btn--active' : ''}`} onClick={() => setPeriod('monthly')}>Monthly</button>
            </div>
          </div>

          <div className="rp-chart-area">
            <svg viewBox={`0 0 ${SVG_W} 185`} width="100%" height="220" preserveAspectRatio="none">
              {guides.map((f, i) => (
                <line key={i} x1={PAD_X} y1={CHART_H * (1 - f)} x2={SVG_W - PAD_X} y2={CHART_H * (1 - f)} stroke="#E2E8F0" strokeWidth="1" />
              ))}
              {pts.map((p, i) => (
                <rect key={`r${i}`} x={p.rescueBar.x} y={p.rescueBar.y} width={p.rescueBar.w} height={p.rescueBar.h} rx="3" fill="rgba(15,82,56,0.18)" />
              ))}
              {pts.map((p, i) => (
                <rect key={`v${i}`} x={p.revenueBar.x} y={p.revenueBar.y} width={p.revenueBar.w} height={p.revenueBar.h} rx="3" fill="#CBD5E1" />
              ))}
              <path d={linePath} fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle key={`d${i}`} cx={p.lineX} cy={p.lineY} r="3.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.8" />
              ))}
              {pts.map((p, i) => (
                <text key={`l${i}`} x={p.labelX} y={LABEL_Y} textAnchor="middle" fontFamily="Work Sans, sans-serif" fontSize="11" fill="#94A3B8" fontWeight="700">{p.label}</text>
              ))}
            </svg>

            <div className="rp-legend">
              <div className="rp-legend-item"><span className="rp-legend-dot" style={{ background: '#66B018' }}></span>FOOD RESCUED</div>
              <div className="rp-legend-item"><span className="rp-legend-dot" style={{ background: '#94A3B8' }}></span>NET REVENUE</div>
            </div>
          </div>
        </div>

      </div>

      <div className="rp-txlog">
        <div className="rp-txlog-header">
          <h3 className="rp-txlog-title">Recent Transaction Log</h3>
          <div className="rp-txlog-controls">
            <div className="rp-format-bar">
              <span className="rp-format-label">PDF / CSV</span>
            </div>
            <div className="rp-export-menu-wrap">
              <button className="rp-export-btn" onClick={() => setShowExportMenu((v) => !v)}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1,1 5,5 9,1" />
                </svg>
                Export All
              </button>
              {showExportMenu && (
                <div className="rp-export-menu">
                  <button className="rp-export-menu-btn" onClick={() => void exportAllCsv()}>CSV</button>
                  <button className="rp-export-menu-btn" onClick={exportAllPdf}>PDF</button>
                </div>
              )}
            </div>
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
            {transactions.map((tx) => (
              <tr key={tx.purchaseID}>
                <td className="rp-td-muted">{tx.purchaseDate ? new Date(tx.purchaseDate).toLocaleDateString() : '-'}</td>
                <td className="rp-td-bold">User {tx.userID.slice(0, 8)}</td>
                <td><span className="rp-type-badge rp-type-badge--seller">Seller</span></td>
                <td className="rp-td-muted">{tx.quantity || 0}kg</td>
                <td><span className={`rp-status ${tx.status?.toLowerCase() === 'completed' ? 'rp-status--completed' : 'rp-status--pending'}`}>{tx.status}</span></td>
                <td className="rp-td-revenue">{formatCurrency(tx.totalPrice || 0)}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6}>No recent transactions available.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="rp-txlog-footer">
          <span className="rp-txlog-count">
            Showing {transactions.length === 0 ? 0 : pageStart + 1}-{pageStart + transactions.length} of {totalTransactions} recent transactions
          </span>
          <div className="rp-pg-controls">
            <button className="rp-pg-btn" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} className={`rp-pg-btn ${currentPage === page ? 'rp-pg-btn--active' : ''}`} onClick={() => goTo(page)}>
                {page}
              </button>
            ))}
            <button className="rp-pg-btn" onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
