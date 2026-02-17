import { useState } from 'react'
import styles from './AuthForm.module.css'

interface RegisterFormProps {
  onSuccess?: () => void
  onToggleLogin: () => void
}

const RegisterForm = ({ onSuccess, onToggleLogin }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      setLoading(false)
      return
    }

    try {
      // TODO: Integrate with backend API
      console.log('Register data:', formData)
      
      // Temporary: simulate API call
      setTimeout(() => {
        setLoading(false)
        alert('Đăng ký thành công! Vui lòng kiểm tra email của bạn.')
        if (onSuccess) onSuccess()
        onToggleLogin()
      }, 1000)
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.authHeader}>
        <span className={styles.authIcon}>🎉</span>
        <h2>Tham gia EDU-AI!</h2>
        <p>Tạo tài khoản và bắt đầu học ngay hôm nay</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        {error && (
          <div className={styles.errorMessage}>
            ⚠️ {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="fullName">Họ và tên</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Chọn tên đăng nhập"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nhập email của bạn"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
            required
            minLength={6}
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
            placeholder="Xác nhận mật khẩu"
            required
            className={styles.input}
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký 🎉'}
        </button>
      </form>

      <div className={styles.authFooter}>
        <p>Bạn đã có tài khoản?{' '}
          <button type="button" className={styles.toggleButton} onClick={onToggleLogin}>
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
