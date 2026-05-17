import { useState, useEffect, useRef } from 'react'
import { notificationsAPI } from '../api/apis'
import './NotificationDropdown.css'

import BellIcon from '../assets/BUYER/Notif bell Icon.svg'

interface Notification {
  id: number
  type: 'new_listing' | 'deal' | 'order_complete' | string
  text: string
  highlight: string
  time: string
  unread: boolean
  meta?: string
  link?: string
}

const TYPE_CONFIG: Record<string, { label: string; iconColor: string; iconBg: string }> = {
  new_listing:    { label: 'New Listing:',    iconColor: '#66B018', iconBg: 'green'  },
  deal:           { label: 'Daily Deal:',     iconColor: '#A04100', iconBg: 'orange' },
  order_complete: { label: 'Order Complete:', iconColor: '#005050', iconBg: 'teal'   },
  order:          { label: 'Order:',          iconColor: '#005050', iconBg: 'teal'   },
  impact:         { label: 'Impact:',         iconColor: '#66B018', iconBg: 'green'  },
}

const DEFAULT_CFG = { label: 'Notification:', iconColor: '#555', iconBg: 'gray' }

const EXPIRY_MS = 30_000
const FADE_MS   = 400

interface NotificationDropdownProps {
  onClose: () => void
  onUnreadCountChange?: (count: number) => void
}

export default function NotificationDropdown({ onClose, onUnreadCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expiringIds, setExpiringIds] = useState<Set<number>>(new Set())

  // Map from id → [fadeTimer, removeTimer]
  const timerRefs = useRef<Map<number, [ReturnType<typeof setTimeout>, ReturnType<typeof setTimeout>]>>(new Map())

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await notificationsAPI.getMyNotifications()
      const transformed: Notification[] = response.data.map((notif: {
        notificationID: number
        type: string
        message: string
        title: string
        createdAt: string
        isRead: boolean
        link?: string
      }) => ({
        id: notif.notificationID,
        type: notif.type || 'new_listing',
        text: notif.message || '',
        highlight: notif.title || '',
        time: new Date(notif.createdAt).toLocaleString(),
        unread: !notif.isRead,
        link: notif.link,
      }))
      setNotifications(transformed)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch notifications'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Cleanup all timers on unmount
    return () => {
      timerRefs.current.forEach(([t1, t2]) => { clearTimeout(t1); clearTimeout(t2) })
    }
  }, [])

  // Notify parent of unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => n.unread).length
    onUnreadCountChange?.(count)
  }, [notifications]) // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleRemoval = (id: number) => {
    if (timerRefs.current.has(id)) return

    const fadeTimer = setTimeout(() => {
      setExpiringIds(prev => { const s = new Set(prev); s.add(id); return s })
    }, EXPIRY_MS - FADE_MS)

    const removeTimer = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
      setExpiringIds(prev => { const s = new Set(prev); s.delete(id); return s })
      timerRefs.current.delete(id)
    }, EXPIRY_MS)

    timerRefs.current.set(id, [fadeTimer, removeTimer])
  }

  const handleItemClick = (notif: Notification) => {
    if (!notif.unread) return
    notificationsAPI.markNotificationAsRead(notif.id.toString()).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n))
    scheduleRemoval(notif.id)
  }

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllNotificationsAsRead()
      const unreadIds = notifications.filter(n => n.unread).map(n => n.id)
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
      unreadIds.forEach(id => scheduleRemoval(id))
    } catch (err: unknown) {
      console.error('Failed to mark all as read.', err)
    }
  }

  return (
    <>
      <div className="notif-backdrop" onClick={onClose} />

      <div className="notif-dropdown">
        <div className="notif-arrow" />

        <div className="notif-header">
          <span className="notif-title">Notifications</span>
          <button className="notif-mark-read" onClick={markAllRead}>
            Mark all as read
          </button>
        </div>

        <div className="notif-list">
          {loading ? (
            <div className="notif-state-msg">Loading…</div>
          ) : error ? (
            <div className="notif-state-msg notif-state-error">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="notif-state-msg">No notifications yet.</div>
          ) : (
            notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CFG
              const isScheduled = timerRefs.current.has(n.id) && !n.unread
              const isExpiring  = expiringIds.has(n.id)
              return (
                <div
                  key={n.id}
                  className={[
                    'notif-item',
                    isScheduled ? 'notif-item--read' : '',
                    isExpiring  ? 'notif-item--expiring' : '',
                  ].join(' ').trim()}
                  onClick={() => handleItemClick(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleItemClick(n)}
                >
                  <div className={`notif-icon ${cfg.iconBg}`}>
                    <img src={BellIcon} alt="Notification" width="18" height="18" />
                  </div>

                  <div className="notif-content">
                    <span className="notif-text">
                      <strong>{cfg.label}</strong> {n.text}
                      <br />
                      <strong>{n.highlight}</strong>
                    </span>
                    {n.meta ? (
                      <span className="notif-time">🌿 {n.meta}</span>
                    ) : (
                      <span className="notif-time">{n.time}</span>
                    )}
                  </div>

                  {n.unread && <div className="notif-unread-dot" />}
                </div>
              )
            })
          )}
        </div>

        <div className="notif-footer">
          <button className="notif-see-all" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}
