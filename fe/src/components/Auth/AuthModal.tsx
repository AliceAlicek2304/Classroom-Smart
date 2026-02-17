import { useState, useEffect } from 'react'
import Modal from '../Modal'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register' | 'forgot-password'
}

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode)

  // Reset mode to initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {mode === 'login' ? (
        <LoginForm 
          onSuccess={onClose} 
          onToggleRegister={() => setMode('register')} 
          onForgotPassword={() => setMode('forgot-password')}
        />
      ) : mode === 'register' ? (
        <RegisterForm 
          onSuccess={onClose} 
          onToggleLogin={() => setMode('login')} 
        />
      ) : (
        <ForgotPasswordForm 
          onBackToLogin={() => setMode('login')}
        />
      )}
    </Modal>
  )
}

export default AuthModal
