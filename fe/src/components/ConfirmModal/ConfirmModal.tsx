import { useEffect } from 'react'
import styles from './ConfirmModal.module.css'

interface ConfirmModalProps {
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'warning',
  onConfirm,
  onCancel
}: ConfirmModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={`${styles.icon} ${styles[variant]}`}>
            {variant === 'danger' && '🗑️'}
            {variant === 'warning' && '⚠️'}
            {variant === 'info' && '📋'}
          </div>
          {title && <h3 className={styles.title}>{title}</h3>}
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            <button className={styles.btnCancel} onClick={onCancel}>
              {cancelText}
            </button>
            <button
              className={`${styles.btnConfirm} ${styles[variant]}`}
              onClick={() => { onConfirm(); onCancel() }}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
