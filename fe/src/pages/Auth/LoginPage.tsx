import { Link } from 'react-router-dom'
import { LoginForm } from '../../components/Auth'
import styles from './Auth.module.css'

const LoginPage = () => {
  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <Link to="/" className={styles.backButton}>
          ← Back to Home
        </Link>

        <div className={`${styles.authCard} clay-card`}>
          <LoginForm 
            onToggleRegister={() => {}} // Navigation handled by Link below or can be added here
          />

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
