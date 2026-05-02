import { useEffect, useState } from 'react'
import './OrderSuccessModal.css'

export interface ImpactStats {
  foodSaved: number    // percentage 0-100
  carbonReduced: number // percentage 0-100
  peopleFed: number     // percentage 0-100
  pointsEarned: number  // absolute number
}

interface OrderSuccessModalProps {
  stats: ImpactStats
  onClose: () => void
}

export default function OrderSuccessModal({ stats, onClose }: OrderSuccessModalProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    // Trigger bar animation after mount
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const statRows = [
    {
      icon: (
        // Fork & knife icon placeholder
        <span className="icon-placeholder" style={{ width: 11, height: 15, background: '#0F5238' }} />
      ),
      label: 'Food Saved',
      value: `${stats.foodSaved} %`,
      percent: stats.foodSaved,
    },
    {
      icon: (
        // QR/carbon icon placeholder
        <span className="icon-placeholder" style={{ width: 14, height: 7, background: '#0F5238' }} />
      ),
      label: 'Carbon Reduced',
      value: `${stats.carbonReduced} %`,
      percent: stats.carbonReduced,
    },
    {
      icon: (
        // People icon placeholder
        <span className="icon-placeholder" style={{ width: 18, height: 9, background: '#0F5238' }} />
      ),
      label: 'People Fed',
      value: `${stats.peopleFed} %`,
      percent: stats.peopleFed,
    },
    {
      icon: (
        // Star/points icon placeholder
        <span className="icon-placeholder" style={{ width: 15, height: 15, background: '#0F5238' }} />
      ),
      label: 'Points Earned',
      value: `${stats.pointsEarned} pts`,
      percent: Math.min(stats.pointsEarned, 100), // cap bar at 100%
    },
  ]

  return (
    <div className="success-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        {/* Leaf icon */}
        <div className="success-icon-circle">
          <svg className="success-leaf-icon" viewBox="0 0 34 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.457 34.025C16.357 34.025 15.249 33.9 14.132 33.65C13.015 33.4 11.874 33.041 10.707 32.575C11.107 28.541 12.274 24.775 14.207 21.275C16.14 17.775 18.624 14.691 21.657 12.025C17.99 13.891 14.815 16.358 12.132 19.425C9.449 22.491 7.574 25.991 6.507 29.925C6.374 29.825 6.249 29.716 6.132 29.6C6.015 29.483 5.89 29.358 5.757 29.225C4.19 27.658 2.999 25.908 2.182 23.975C1.365 22.041 0.957 20.025 0.957 17.925C0.957 15.658 1.407 13.491 2.307 11.425C3.207 9.358 4.457 7.525 6.057 5.925C8.757 3.225 12.257 1.466 16.557 0.65C20.857 -0.167 26.89 -0.242 34.657 0.425C35.257 8.391 35.157 14.466 34.357 18.65C33.557 22.833 31.824 26.258 29.157 28.925C27.524 30.558 25.699 31.816 23.682 32.7C21.665 33.583 19.59 34.025 17.457 34.025Z"
              fill="#0F5238"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="success-heading">Order Successful!</h2>
        <p className="success-subtext">You've made a real difference today.</p>

        {/* Stats */}
        <div className="success-stats">
          {statRows.map((row, i) => (
            <div key={row.label} className="stat-row">
              <div className="stat-label-row">
                <div className="stat-label-left">
                  {row.icon}
                  <span className="stat-label-text">{row.label}</span>
                </div>
                <span
                  className={`stat-value ${animated ? 'visible' : ''}`}
                  style={{ transitionDelay: `${0.6 + i * 0.2}s` }}
                >
                  {row.value}
                </span>
              </div>
              <div className="stat-bar-bg">
                <div
                  className="stat-bar-fill"
                  style={{
                    width: animated ? `${row.percent}%` : '0%',
                    transitionDelay: `${i * 0.15}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* OK Button */}
        <button className="success-ok-btn" onClick={onClose}>
          <span>OK</span>
          <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7.198 13.167L13.073 7.292L11.907 6.125L7.198 10.833L4.823 8.458L3.657 9.625L7.198 13.167ZM8.365 17.667C7.212 17.667 6.129 17.448 5.115 17.01C4.101 16.573 3.219 15.979 2.469 15.229C1.719 14.479 1.125 13.597 0.688 12.583C0.25 11.569 0.032 10.486 0.032 9.333C0.032 8.181 0.25 7.097 0.688 6.083C1.125 5.069 1.719 4.188 2.469 3.438C3.219 2.688 4.101 2.094 5.115 1.656C6.129 1.219 7.212 1 8.365 1C9.518 1 10.601 1.219 11.615 1.656C12.629 2.094 13.511 2.688 14.261 3.438C15.011 4.188 15.605 5.069 16.042 6.083C16.48 7.097 16.698 8.181 16.698 9.333C16.698 10.486 16.48 11.569 16.042 12.583C15.605 13.597 15.011 14.479 14.261 15.229C13.511 15.979 12.629 16.573 11.615 17.01C10.601 17.448 9.518 17.667 8.365 17.667Z"
              fill="white"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
