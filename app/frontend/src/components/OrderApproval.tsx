import { useState, useEffect } from 'react';
import './OrderApproval.css';
import { purchaseAPI } from '../api/apis';

interface OrderApprovalProps {
  onBack: () => void;
  sellerId: string;
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });
}

export default function OrderApproval({ onBack, sellerId }: OrderApprovalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingID, setApprovingID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchOrders = () => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    purchaseAPI.getSellerOrders(sellerId)
      .then(res => {
        const pending = (res.data as Order[]).filter(o => o.status === 'pending');
        setOrders(pending);
      })
      .catch(() => setError('Failed to load orders. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [sellerId]);

  const handleApprove = async (purchaseID: string) => {
    setApprovingID(purchaseID);
    setError(null);
    setSuccessMsg(null);
    try {
      await purchaseAPI.approve(purchaseID);
      setOrders(prev => prev.filter(o => o.purchaseID !== purchaseID));
      setSuccessMsg('Order approved successfully!');
    } catch (err: any) {
      const detail = (err as any)?.response?.data?.detail;
      setError(detail ?? 'Failed to approve order.');
    } finally {
      setApprovingID(null);
    }
  };

  return (
    <div className="oa-page">
      <div className="oa-header-section">
        <nav className="oa-breadcrumb">
          <button className="oa-breadcrumb-link" onClick={onBack}>Dashboard</button>
          <svg className="oa-breadcrumb-sep" width="5" height="8" viewBox="0 0 5 8" fill="none">
            <path d="M1 1l3 3-3 3" stroke="#66B018" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="oa-breadcrumb-current">Order Approvals</span>
        </nav>
        <div className="oa-header-row">
          <div>
            <h1 className="oa-title">Order Approvals</h1>
            <p className="oa-subtitle">Review and approve pending orders from buyers.</p>
          </div>
          <button className="oa-refresh-btn" onClick={fetchOrders} aria-label="Refresh">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="oa-error" role="alert">
          {error}
          <button className="oa-banner-close" onClick={() => setError(null)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="oa-success" role="status">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          {successMsg}
          <button className="oa-banner-close" onClick={() => setSuccessMsg(null)} aria-label="Dismiss">✕</button>
        </div>
      )}

      <div className="oa-table-card">
        <div className="oa-table-header">
          <div className="oa-th oa-th-buyer">BUYER</div>
          <div className="oa-th">ITEM</div>
          <div className="oa-th">QTY</div>
          <div className="oa-th">TOTAL</div>
          <div className="oa-th">DATE</div>
          <div className="oa-th oa-th-action">ACTION</div>
        </div>

        <div className="oa-table-body">
          {loading ? (
            <div className="oa-state-msg">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="oa-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#BFC9C1" strokeWidth="1.2" strokeLinecap="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              <p>No pending orders right now.</p>
              <span>Orders from buyers will appear here for your approval.</span>
            </div>
          ) : (
            orders.map((order) => (
              <div key={`${order.purchaseID}-${order.foodName}`} className="oa-table-row">
                <div className="oa-td oa-td-buyer">
                  <div className="oa-buyer-avatar">
                    {order.buyerName.charAt(0).toUpperCase()}
                  </div>
                  <span>{order.buyerName}</span>
                </div>
                <div className="oa-td">{order.foodName}</div>
                <div className="oa-td">{order.quantity}</div>
                <div className="oa-td">₱{order.totalPerItem.toFixed(2)}</div>
                <div className="oa-td">{formatDate(order.purchaseDate)}</div>
                <div className="oa-td oa-td-action">
                  <button
                    className="oa-approve-btn"
                    onClick={() => handleApprove(order.purchaseID)}
                    disabled={approvingID === order.purchaseID}
                  >
                    {approvingID === order.purchaseID ? 'Approving…' : 'Approve'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && orders.length > 0 && (
          <div className="oa-table-footer">
            {orders.length} pending order{orders.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
