import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Auth.module.css'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Integrate with backend API
      console.log('Forgot password for:', email)
      
      // Temporary: simulate API call
      setTimeout(() => {
        setLoading(false)
        setSuccess(true)
      }, 1000)
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <Link to="/login" className={styles.backButton}>
          ← Back to Login
        </Link>

        <div className={`${styles.authCard} clay-card`}>
          <div className={styles.authHeader}>
            <div className={styles.authIcon}>🔐</div>
            <h1>Forgot Password?</h1>
            <p>No worries! We'll send you reset instructions</p>
          </div>

          {success ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✅</div>
              <h3>Email Sent!</h3>
              <p>Check your email for password reset instructions.</p>
              <Link to="/login" className={`${styles.submitButton} clay-button`}>
                Back to Login
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
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className={styles.input}
                />
              </div>

              <button 
                type="submit" 
                className={`${styles.submitButton} clay-button`}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link 📧'}
              </button>
            </form>
          )}

          <div className={styles.authFooter}>
            <p>Remember your password? <Link to="/login" className={styles.link}>Login here</Link></p>
          </div>
        </div>

        <div className={styles.authDecoration}>
          <div className={`${styles.decorCard} clay-card`}>🔑</div>
          <div className={`${styles.decorCard} clay-card`}>📧</div>
          <div className={`${styles.decorCard} clay-card`}>🔓</div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
