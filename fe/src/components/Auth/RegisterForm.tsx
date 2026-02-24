import { useState } from 'react'
import { authAPI } from '../../services/authService'
import { useToast } from '../Toast'
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
    confirmPassword: '',
    birthDay: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

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
      const response = await authAPI.register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        birthDay: formData.birthDay || undefined
      })

      if (response.success) {
        toast.success(response.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
        if (onSuccess) onSuccess()
        onToggleLogin()
      } else {
        setError(response.message || 'Đăng ký thất bại. Vui lòng thử lại.')
      }
    } catch (err: unknown) {
      const errorResponse = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(errorResponse?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.authHeader}>
        <span className={styles.authIcon}>🎉</span>
        <h2>Tham gia Classroom Smart!</h2>
        <p>Tạo tài khoản để bắt đầu sử dụng hệ thống</p>
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
          <label htmlFor="birthDay">Ngày sinh</label>
          <input
            type="date"
            id="birthDay"
            name="birthDay"
            value={formData.birthDay}
            onChange={handleChange}
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
