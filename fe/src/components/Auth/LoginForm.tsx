import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { useToast } from '../Toast'
import authAPI from '../../services/authService'
import styles from './AuthForm.module.css'

interface LoginFormProps {
  onSuccess?: () => void
  onToggleRegister: () => void
  onForgotPassword?: () => void
}

const LoginForm = ({ onSuccess, onToggleRegister, onForgotPassword }: LoginFormProps) => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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

    try {
      const response = await authAPI.login(formData)
      
      if (response.success && response.data.token) {
        await login(response.data.token, response.data.refreshToken)
        toast.success('Đăng nhập thành công! 🎉')
        
        const userResponse = await authAPI.getCurrentUser()
        if (userResponse.success) {
          const role = userResponse.data.role
          if (onSuccess) {
            onSuccess()
          }
          
          if (role === 'ADMIN') {
            navigate('/admin')
          } else if (role === 'TEACHER') {
            navigate('/teacher')
          } else {
            navigate('/')
          }
        } else {
          if (onSuccess) onSuccess()
          navigate('/')
        }
      } else {
        setError(response.message || 'Đăng nhập thất bại')
        toast.error(response.message || 'Đăng nhập thất bại')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.authHeader}>
        <span className={styles.authIcon}>🎓</span>
        <h2>Chào mừng trở lại!</h2>
        <p>Đăng nhập để tiếp tục hành trình học tập</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        {error && (
          <div className={styles.errorMessage}>
            ⚠️ {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Nhập tên đăng nhập của bạn"
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
            placeholder="Nhập mật khẩu"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formOptions}>
          <label className={styles.checkbox}>
            <input type="checkbox" />
            <span>Ghi nhớ tôi</span>
          </label>
          <button 
            type="button" 
            className={styles.toggleButton}
            onClick={onForgotPassword}
          >
            Quên mật khẩu?
          </button>
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập 🚀'}
        </button>
      </form>

      <div className={styles.authFooter}>
        <p>Bạn chưa có tài khoản?{' '}
          <button type="button" className={styles.toggleButton} onClick={onToggleRegister}>
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
