import { Link } from 'react-router-dom'
import { RegisterForm } from '../../components/Auth'
import styles from './Auth.module.css'

const RegisterPage = () => {
  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <Link to="/" className={styles.backButton}>
          ← Back to Home
        </Link>

        <div className={`${styles.authCard} clay-card`}>
          <RegisterForm 
            onToggleLogin={() => {}} // Navigation handled by Link below
          />

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
