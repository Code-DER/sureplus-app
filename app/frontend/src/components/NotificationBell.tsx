import { useState, useEffect } from 'react'
import NotificationDropdown from './NotificationDropdown'
import { notificationsAPI } from '../api/apis'
import './NotificationBell.css'

interface NotificationBellProps {
  buttonClassName?: string
  children: React.ReactNode
}

export default function NotificationBell({
  buttonClassName = 'notif-bell-btn',
  children,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnread = () => {
    notificationsAPI.getMyNotifications()
      .then(res => {
        const count = (res.data as { isRead: boolean }[]).filter(n => !n.isRead).length
        setUnreadCount(count)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchUnread()
    const id = setInterval(fetchUnread, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="notif-bell-wrapper">
      <button
        className={buttonClassName}
        aria-label="Notifications"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
      >
        {children}
      </button>
      {unreadCount > 0 && (
        <span className="notif-badge" aria-label={`${unreadCount} unread`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {open && (
        <NotificationDropdown
          onClose={() => setOpen(false)}
          onUnreadCountChange={setUnreadCount}
        />
      )}
    </div>
  )
}
