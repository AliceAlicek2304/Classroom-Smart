import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Auth.module.css'

const RegisterPage = () => {
  const navigate = useNavigate()
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
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // TODO: Integrate with backend API
      console.log('Register data:', formData)
      
      // Temporary: simulate API call
      setTimeout(() => {
        setLoading(false)
        alert('Registration successful! Please check your email for verification.')
        navigate('/login')
      }, 1000)
    } catch (err) {
      setError('Registration failed. Please try again.')
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
            <div className={styles.authIcon}>🎉</div>
            <h1>Join EDU-AI!</h1>
            <p>Create your account and start learning today</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && (
              <div className={styles.errorMessage}>
                ⚠️ {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
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
                placeholder="Enter your email"
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
                placeholder="Create a password (min 6 characters)"
                required
                minLength={6}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className={styles.input}
              />
            </div>

            <button 
              type="submit" 
              className={`${styles.submitButton} clay-button`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register 🎉'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>Already have an account? <Link to="/login" className={styles.link}>Login here</Link></p>
          </div>
        </div>

        <div className={styles.authDecoration}>
          <div className={`${styles.decorCard} clay-card`}>🚀</div>
          <div className={`${styles.decorCard} clay-card`}>💡</div>
          <div className={`${styles.decorCard} clay-card`}>🎯</div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
