import { useNavigate, Link } from 'react-router-dom'
import { ForgotPasswordForm } from '../../components/Auth'
import styles from './Auth.module.css'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <Link to="/login" className={styles.backButton}>
          ← Back to Login
        </Link>

        <div className={`${styles.authCard} clay-card`}>
          <ForgotPasswordForm 
            onBackToLogin={() => navigate('/login')}
          />
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
