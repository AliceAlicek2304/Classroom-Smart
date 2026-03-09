import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { useToast } from '../Toast'
import styles from './StudentLayout.module.css'

interface StudentLayoutProps {
  children: ReactNode
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()

  const handleLogout = () => {
    logout()
    toast.success('Đăng xuất thành công!')
    navigate('/')
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">✕</button>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🎓</span>
            <span className={styles.logoText}>Student Panel</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.navLabel}>Khóa học</div>
            <Link 
              to="/customer/my-classrooms" 
              className={`${styles.navLink} ${isActive('/customer/my-classrooms') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>🎒</span>
              Lớp của tôi
            </Link>
            <Link 
              to="/customer/classrooms" 
              className={`${styles.navLink} ${isActive('/customer/classrooms') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>🏫</span>
              Tất cả các lớp
            </Link>
            <Link 
              to="/customer/docs" 
              className={`${styles.navLink} ${isActive('/customer/docs') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📖</span>
              Tài liệu
            </Link>
            <Link 
              to="/customer/assignments" 
              className={`${styles.navLink} ${isActive('/customer/assignments') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📝</span>
              Bài tập & Kiểm tra
            </Link>
            <Link 
              to="/customer/grades" 
              className={`${styles.navLink} ${isActive('/customer/grades') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📈</span>
              Bảng điểm
            </Link>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.avatar ? (
                <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080${user.avatar}`} alt={user.fullName} />
              ) : (
                <span>{getInitials(user?.fullName)}</span>
              )}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.fullName}</div>
              <div className={styles.userRole}>Học sinh</div>
            </div>
          </div>
          <Link to="/" className={styles.homeBtn}>
            <span>🏠</span> Trang chủ
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <button className={styles.hamburger} onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          ☰
        </button>
        {children}
      </main>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

export default StudentLayout
