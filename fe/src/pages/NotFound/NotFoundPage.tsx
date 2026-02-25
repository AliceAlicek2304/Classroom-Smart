import { Link, useNavigate } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>

      <div className={styles.card}>
        <div className={styles.illustration}>🧭</div>
        <h1 className={styles.title}>Trang không tồn tại!</h1>
        <p className={styles.subtitle}>
          Có vẻ bạn đã đi lạc khỏi bản đồ rồi. Trang bạn đang tìm kiếm không tồn tại
          hoặc đã bị di chuyển đến nơi khác.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.btnHome}>
            🏠 Về trang chủ
          </Link>
          <button className={styles.btnBack} onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  )
}
