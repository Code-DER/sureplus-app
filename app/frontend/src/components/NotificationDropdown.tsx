import { useState, useEffect } from 'react'
import { notificationsAPI } from '../api/apis'
import './NotificationDropdown.css'

import BellIcon from '../assets/BUYER/Notif bell Icon.svg'

interface Notification {
  id: number
  type: 'new_listing' | 'deal' | 'order_complete' | string
  text: string       // plain text with HTML-safe substrings
  highlight: string  // bold portion
  time: string
  unread: boolean
  meta?: string      // small grey subtitle e.g. "2.4kg CO₂ saved"
  link?: string
}

// const MOCK_NOTIFICATIONS: Notification[] = [
//   {
//     id: 1,
//     type: 'new_listing',
//     text: 'Nanami walang damit at ',
//     highlight: 'Le Petit Bistro',
//     time: '2m ago',
//     unread: true,
//   },
//   {
//     id: 2,
//     type: 'deal',
//     text: '50% off all ',
//     highlight: 'Surplus Veggie Bundles',
//     time: '1h ago',
//     unread: true,
//   },
//   {
//     id: 3,
//     type: 'order_complete',
//     text: 'Rescue from ',
//     highlight: 'Kali Market Central',
//     time: '',
//     unread: false,
//     meta: '2.4kg CO₂ saved',
//   },
// ]

const TYPE_CONFIG: Record<Notification['type'], { label: string; iconColor: string; iconBg: string }> = {
  new_listing: { label: 'New Listing:', iconColor: '#0F5238', iconBg: 'green' },
  deal:        { label: 'Daily Deal:', iconColor: '#A04100', iconBg: 'orange' },
  order_complete: { label: 'Order Complete:', iconColor: '#005050', iconBg: 'teal' },
}

const DEFAULT_NOTIFICATION_CONFIG = {
  label: 'Notification:',
  iconColor: '#555',
  iconBg: 'gray',
}

interface NotificationDropdownProps {
  onClose: () => void
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await notificationsAPI.getMyNotifications()

      // Transform the backend data into the interface of frontend
      const transformedNotifications: Notification[] = response.data.map((notif: {
        notificationID: number;
        type: string;
        message: string;
        title: string;
        createdAt: string;
        isRead: boolean;
        link?: string;
      }) => ({
        id: notif.notificationID,
        type: (notif.type as Notification['type']) || 'new_listing',
        text: notif.message || '',
        highlight: notif.title || '',
        time: new Date(notif.createdAt).toLocaleString(),
        unread: !notif.isRead,
        meta: undefined,
        link: notif.link,
      }))
      setNotifications(transformedNotifications)
    } catch (error: unknown) {
      console.error('Failed to fetch notifications', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    } catch (error: unknown) {
      console.error('Failed to mark all as read.', error)
    }
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
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>{error}</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No notifications yet.</div>
          ) : (
          notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_NOTIFICATION_CONFIG
            return (
              <div key={n.id} className="notif-item">
                {/* Colored icon */}
                <div className={`notif-icon ${cfg.iconBg}`}>
                  <img
                    src={BellIcon}
                    alt="Notification"
                    width="18"
                    height="18"
                  />
                </div>

                {/* Text */}
                <div className="notif-content">
                  <span className="notif-text">
                    <strong>{cfg.label}</strong> {n.text}
                    <br></br>
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
          })
          )}
        </div>

        {/* Footer */}
        <div className="notif-footer">
          <button className="notif-see-all" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  )
}
