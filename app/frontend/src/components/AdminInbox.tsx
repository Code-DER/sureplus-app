import { useEffect, useState } from 'react';
import './AdminReports.css';
import { adminAPI } from '../api/apis';

type Period = 'weekly' | 'monthly';

type BadActor = {
  userID: string;
  name: string;
  lowRatings: number;
};

type Incident = {
  ratingID: string;
  sellerName: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  purchaseID?: string;
};

type BadActorReport = {
  summary: {
    totalReviews: number;
    lowRatings: number;
    flaggedSellers: number;
    watchlistSellers: number;
  };
  badActors: BadActor[];
  recentIncidents: Incident[];
};

const SVG_W = 560, CHART_H = 150, LABEL_Y = 170, PAD_X = 8;

function buildChart(data: Array<{ label: string; bad: number; total: number }>) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.bad, d.total)));
  const monthW = (SVG_W - PAD_X * 2) / Math.max(1, data.length);
  const BAR_W = 15, BAR_GAP = 4;
  return data.map((d, i) => {
    const groupW = BAR_W * 2 + BAR_GAP;
    const gx = PAD_X + i * monthW + (monthW - groupW) / 2;
    const bh = (d.bad / max) * CHART_H;
    const th = (d.total / max) * CHART_H;
    return {
      label: d.label,
      labelX: PAD_X + i * monthW + monthW / 2,
      badBar: { x: gx, y: CHART_H - bh, w: BAR_W, h: bh },
      totalBar: { x: gx + BAR_W + BAR_GAP, y: CHART_H - th, w: BAR_W, h: th },
      lineX: gx + BAR_W + BAR_GAP + BAR_W / 2,
      lineY: CHART_H - th,
    };
  });
}

export default function AdminInbox() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [report, setReport] = useState<BadActorReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getBadActorsReport(25);
        setReport(res.data ?? null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const incidents = report?.recentIncidents ?? [];
  const monthly = incidents.reduce<Record<string, { bad: number; total: number }>>((acc, row) => {
    const month = row.createdAt ? new Date(row.createdAt).toLocaleString('en-US', { month: 'short' }) : 'N/A';
    if (!acc[month]) acc[month] = { bad: 0, total: 0 };
    acc[month].bad += 1;
    acc[month].total += 1;
    return acc;
  }, {});
  const chartData = Object.entries(monthly).map(([label, values]) => ({ label, bad: values.bad, total: values.total })).slice(-7);
  const pts = buildChart(chartData.length > 0 ? chartData : [{ label: 'N/A', bad: 0, total: 0 }]);
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.lineX},${p.lineY}`).join(' ');
  const guides = [0.25, 0.5, 0.75, 1];

  return (
    <div className="rp-layout">
      {loading && <p>Loading inbox moderation feed...</p>}

      <div className="rp-topbar">
        <button className="rp-apply-btn">Moderation Inbox</button>
      </div>

      <div className="rp-stat-grid">
        <div className="rp-stat-card"><p className="rp-stat-name">Total Reviews</p><p className="rp-stat-val">{report?.summary.totalReviews ?? 0}</p><p className="rp-stat-sub">All seller ratings logged</p></div>
        <div className="rp-stat-card"><p className="rp-stat-name">Low Ratings</p><p className="rp-stat-val">{report?.summary.lowRatings ?? 0}</p><p className="rp-stat-sub">Ratings scored 1-2</p></div>
        <div className="rp-stat-card rp-stat-card--featured"><p className="rp-stat-name rp-stat-name--green">Flagged Sellers</p><p className="rp-stat-val">{report?.summary.flaggedSellers ?? 0}</p><p className="rp-stat-sub">Sellers with at least one low rating</p></div>
        <div className="rp-stat-card"><p className="rp-stat-name">Watchlist</p><p className="rp-stat-val">{report?.summary.watchlistSellers ?? 0}</p><p className="rp-stat-sub">2+ consecutive low reviews (tracking only)</p></div>
      </div>

      <div className="rp-bento">
        <div className="rp-chart-card">
          <div className="rp-chart-header">
            <div>
              <h3 className="rp-chart-title">Low-Rating Incidents</h3>
              <p className="rp-chart-sub">Trend of reported low ratings over time</p>
            </div>
            <div className="rp-period-toggle">
              <button className={`rp-period-btn ${period === 'weekly' ? 'rp-period-btn--active' : ''}`} onClick={() => setPeriod('weekly')}>Weekly</button>
              <button className={`rp-period-btn ${period === 'monthly' ? 'rp-period-btn--active' : ''}`} onClick={() => setPeriod('monthly')}>Monthly</button>
            </div>
          </div>
          <div className="rp-chart-area">
            <svg viewBox={`0 0 ${SVG_W} 185`} width="100%" height="220" preserveAspectRatio="none">
              {guides.map((f, i) => <line key={i} x1={PAD_X} y1={CHART_H * (1 - f)} x2={SVG_W - PAD_X} y2={CHART_H * (1 - f)} stroke="#E2E8F0" strokeWidth="1" />)}
              {pts.map((p, i) => <rect key={`b${i}`} x={p.badBar.x} y={p.badBar.y} width={p.badBar.w} height={p.badBar.h} rx="3" fill="rgba(186,26,26,0.25)" />)}
              {pts.map((p, i) => <rect key={`t${i}`} x={p.totalBar.x} y={p.totalBar.y} width={p.totalBar.w} height={p.totalBar.h} rx="3" fill="#CBD5E1" />)}
              <path d={linePath} fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round" />
              {pts.map((p, i) => <circle key={`d${i}`} cx={p.lineX} cy={p.lineY} r="3.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.8" />)}
              {pts.map((p, i) => <text key={`l${i}`} x={p.labelX} y={LABEL_Y} textAnchor="middle" fontFamily="Work Sans, sans-serif" fontSize="11" fill="#94A3B8" fontWeight="700">{p.label}</text>)}
            </svg>
          </div>
        </div>

        <div className="rp-right-col">
          <div className="rp-barangay-card">
            <h3 className="rp-barangay-title">Top Flagged Sellers</h3>
            <div className="rp-barangay-list">
              {(report?.badActors ?? []).slice(0, 3).map((seller) => (
                <div className="rp-barangay-item" key={seller.userID}>
                  <span className="rp-barangay-name">{seller.name}</span>
                  <span className="rp-barangay-score">{seller.lowRatings} low</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rp-txlog">
        <div className="rp-txlog-header">
          <h3 className="rp-txlog-title">Bad Actor Incident Log</h3>
        </div>
        <table className="rp-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>SELLER</th>
              <th>RATING</th>
              <th>COMMENT</th>
              <th>PURCHASE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((row) => (
              <tr key={row.ratingID}>
                <td className="rp-td-muted">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</td>
                <td className="rp-td-bold">{row.sellerName}</td>
                <td><span className="rp-type-badge rp-type-badge--pending">{row.rating}/5</span></td>
                <td className="rp-td-muted">{row.comment || 'No comment'}</td>
                <td className="rp-td-muted">{row.purchaseID ? row.purchaseID.slice(0, 8) : '-'}</td>
                <td><span className="rp-status rp-status--pending">Needs Review</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
