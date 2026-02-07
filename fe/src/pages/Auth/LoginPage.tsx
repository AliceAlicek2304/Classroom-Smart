import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { useToast } from '../../components/Toast'
import authAPI from '../../services/authService'
import styles from './Auth.module.css'

const LoginPage = () => {
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
        navigate('/')
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
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <Link to="/" className={styles.backButton}>
          ← Back to Home
        </Link>

        <div className={`${styles.authCard} clay-card`}>
          <div className={styles.authHeader}>
            <div className={styles.authIcon}>🎓</div>
            <h1>Welcome Back!</h1>
            <p>Login to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && (
              <div className={styles.errorMessage}>
                ⚠️ {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkbox}>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className={`${styles.submitButton} clay-button`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login 🚀'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>Don't have an account? <Link to="/register" className={styles.link}>Register here</Link></p>
          </div>
        </div>

        <div className={styles.authDecoration}>
          <div className={`${styles.decorCard} clay-card`}>📚</div>
          <div className={`${styles.decorCard} clay-card`}>🎯</div>
          <div className={`${styles.decorCard} clay-card`}>⭐</div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
