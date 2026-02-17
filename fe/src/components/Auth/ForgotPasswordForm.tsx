import { useState } from 'react'
import { authAPI } from '../../services/authService'
import { useToast } from '../Toast'
import styles from './AuthForm.module.css'

interface ForgotPasswordFormProps {
  onSuccess?: () => void
  onBackToLogin: () => void
}

const ForgotPasswordForm = ({ onSuccess, onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEmailInvalid, setIsEmailInvalid] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setIsEmailInvalid(false)

    try {
      const response = await authAPI.forgotPassword(email)
      
      if (response.success) {
        setSubmitted(true)
        toast.success('Liên kết đặt lại mật khẩu đã được gửi! 📧')
      } else {
        setError(response.message || 'Gửi yêu cầu thất bại')
        setIsEmailInvalid(true)
        // No toast for email not found as requested
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
      setError(errorMsg)
      setIsEmailInvalid(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={styles.authFormContainer}>
        <div className={styles.authHeader}>
          <div className={styles.authIcon}>📧</div>
          <h2>Kiểm tra Email</h2>
          <p>Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến <strong>{email}</strong>. Liên kết này có hiệu lực trong 5 phút.</p>
        </div>
        <button 
          onClick={onBackToLogin} 
          className={styles.submitButton}
          style={{ marginTop: '20px' }}
        >
          Quay lại Đăng nhập
        </button>
      </div>
    )
  }

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.authHeader}>
        <div className={styles.authIcon}>🔑</div>
        <h2>Quên mật khẩu?</h2>
        <p>Đừng lo lắng! Hãy nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (isEmailInvalid) {
                setIsEmailInvalid(false)
                setError('')
              }
            }}
            placeholder="Nhập email của bạn"
            required
            className={`${styles.input} ${isEmailInvalid ? styles.invalid : ''}`}
          />
          {error && isEmailInvalid && (
            <span className={styles.fieldError}>{error}</span>
          )}
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu 🚀'}
        </button>
      </form>

      <div className={styles.authFooter}>
        <p>Bạn đã nhớ ra mật khẩu? <button onClick={onBackToLogin} className={styles.toggleButton}>Đăng nhập ngay</button></p>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
