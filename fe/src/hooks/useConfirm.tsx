import { useState, useCallback, type ReactNode } from 'react'
import ConfirmModal from '../components/ConfirmModal'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    message: ''
  })
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    
    return new Promise((resolve) => {
      setResolver(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    if (resolver) {
      resolver(true)
      setResolver(null)
    }
    setIsOpen(false)
  }

  const handleCancel = () => {
    if (resolver) {
      resolver(false)
      setResolver(null)
    }
    setIsOpen(false)
  }

  const confirmDialog: ReactNode = (
    <ConfirmModal
      isOpen={isOpen}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { confirm, confirmDialog }
}
