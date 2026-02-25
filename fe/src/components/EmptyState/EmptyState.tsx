import { ReactNode } from 'react'
import styles from './EmptyState.module.css'

// Built-in SVG illustrations
const DefaultIllustration = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
    {/* Stack of books */}
    <rect x="20" y="58" width="56" height="10" rx="3" fill="#e2e8f0" stroke="#1a1a2e" strokeWidth="2"/>
    <rect x="24" y="46" width="48" height="12" rx="3" fill="#c7d2fe" stroke="#1a1a2e" strokeWidth="2"/>
    <rect x="28" y="34" width="40" height="12" rx="3" fill="#a5b4fc" stroke="#1a1a2e" strokeWidth="2"/>
    {/* Magnifying glass */}
    <circle cx="65" cy="28" r="12" fill="#fef9c3" stroke="#1a1a2e" strokeWidth="2.5"/>
    <line x1="73" y1="37" x2="82" y2="46" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round"/>
    {/* Question mark inside lens */}
    <text x="65" y="33" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1a2e">?</text>
  </svg>
)

interface EmptyStateProps {
  illustration?: ReactNode
  icon?: string
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState = ({ illustration, icon, title, message, action }: EmptyStateProps) => (
  <div className={styles.wrapper}>
    <div className={styles.illustration}>
      {illustration ?? (icon
        ? <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>{icon}</span>
        : <DefaultIllustration />
      )}
    </div>
    <h3 className={styles.title}>{title}</h3>
    {message && <p className={styles.message}>{message}</p>}
    {action && (
      <button className={styles.action} onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
)
