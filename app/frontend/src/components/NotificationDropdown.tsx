import { useState } from 'react'
import './NotificationDropdown.css'

interface Notification {
  id: number
  type: 'new_listing' | 'deal' | 'order_complete'
  text: string       // plain text with HTML-safe substrings
  highlight: string  // bold portion
  time: string
  unread: boolean
  meta?: string      // small grey subtitle e.g. "2.4kg CO₂ saved"
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'new_listing',
    text: 'Nanami walang damit at ',
    highlight: 'Le Petit Bistro',
    time: '2m ago',
    unread: true,
  },
  {
    id: 2,
    type: 'deal',
    text: '50% off all ',
    highlight: 'Surplus Veggie Bundles',
    time: '1h ago',
    unread: true,
  },
  {
    id: 3,
    type: 'order_complete',
    text: 'Rescue from ',
    highlight: 'Kali Market Central',
    time: '',
    unread: false,
    meta: '2.4kg CO₂ saved',
  },
]

const TYPE_CONFIG: Record<
  Notification['type'],
  { label: string; iconColor: string; iconBg: string }
> = {
  new_listing: { label: 'New Listing:', iconColor: '#0F5238', iconBg: 'green' },
  deal:        { label: 'Daily Deal:', iconColor: '#A04100', iconBg: 'orange' },
  order_complete: { label: 'Order Complete:', iconColor: '#005050', iconBg: 'teal' },
}

interface NotificationDropdownProps {
  onClose: () => void
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <>
      {/* Invisible backdrop to detect outside clicks */}
      <div className="notif-backdrop" onClick={onClose} />

      <div className="notif-dropdown">
        {/* Arrow pointer */}
        <div className="notif-arrow" />

        {/* Header */}
        <div className="notif-header">
          <span className="notif-title">Notifications</span>
          <button className="notif-mark-read" onClick={markAllRead}>
            Mark all as read
          </button>
        </div>

        {/* Items */}
        <div className="notif-list">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type]
            return (
              <div key={n.id} className="notif-item">
                {/* Colored icon */}
                <div className={`notif-icon ${cfg.iconBg}`}>
                  <span
                    className="icon-placeholder"
                    style={{ width: 18, height: 18, background: cfg.iconColor, borderRadius: 4 }}
                  />
                </div>

                {/* Text */}
                <div className="notif-content">
                  <span className="notif-text">
                    <strong>{cfg.label}</strong> {n.text}
                    <strong>{n.highlight}</strong>
                  </span>
                  {n.meta ? (
                    <span className="notif-time">🌿 {n.meta}</span>
                  ) : (
                    <span className="notif-time">{n.time}</span>
                  )}
                </div>

                {/* Unread dot */}
                {n.unread && <div className="notif-unread-dot" />}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="notif-footer">
          <button className="notif-see-all" onClick={onClose}>
            See all notifications
          </button>
        </div>
      </div>
    </>
  )
}
