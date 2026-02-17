import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/authService'
import { useToast } from '../../components/Toast'
import styles from './Auth.module.css'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const toast = useToast()

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Token đặt lại mật khẩu không tìm thấy!')
      navigate('/')
    }
  }, [token, navigate, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.resetPassword(token || '', formData.newPassword)
      
      if (response.success) {
        setSuccess(true)
        toast.success('Đặt lại mật khẩu thành công! 🎉')
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        setError(response.message || 'Đặt lại mật khẩu thất bại')
        toast.error(response.message || 'Đặt lại mật khẩu thất bại')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Đã xảy ra lỗi. Token có thể đã hết hạn (5 phút).'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <Link to="/" className={styles.backButton}>
          ← Quay lại Trang chủ
        </Link>

        <div className={`${styles.authCard} clay-card`}>
          <div className={styles.authHeader}>
            <div className={styles.authIcon}>🛡️</div>
            <h2>Đặt lại mật khẩu</h2>
            <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          {success ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✅</div>
              <h3>Mật khẩu đã được cập nhật!</h3>
              <p>Bạn sẽ được chuyển hướng về trang chủ trong giây lát...</p>
              <Link to="/" className={styles.submitButton} style={{ marginTop: '20px', display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                Về Trang chủ ngay
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.authForm}>
              {error && (
                <div className={styles.errorMessage}>
                  ⚠️ {error}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới"
                  required
                  autoComplete="new-password"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  autoComplete="new-password"
                  className={styles.input}
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu 🚀'}
              </button>
            </form>
          )}
        </div>

        <div className={styles.authDecoration}>
          <div className={`${styles.decorCard} clay-card`}>🔑</div>
          <div className={`${styles.decorCard} clay-card`}>🛡️</div>
          <div className={`${styles.decorCard} clay-card`}>✨</div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
