import { type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { useToast } from '../Toast'
import styles from './TeacherLayout.module.css'

interface TeacherLayoutProps {
  children: ReactNode
}

const TeacherLayout = ({ children }: TeacherLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()

  const handleLogout = () => {
    logout()
    toast.success('Đăng xuất thành công!')
    navigate('/')
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🎓</span>
            <span className={styles.logoText}>Teacher Panel</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <Link 
            to="/teacher" 
            className={location.pathname === '/teacher' ? styles.navLinkActive : styles.navLink}
          >
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </Link>
          <Link 
            to="/teacher/classrooms" 
            className={location.pathname === '/teacher/classrooms' ? styles.navLinkActive : styles.navLink}
          >
            <span className={styles.navIcon}>🏫</span>
            Lớp học của tôi
          </Link>
          <Link 
            to="/teacher/assignments" 
            className={location.pathname === '/teacher/assignments' ? styles.navLinkActive : styles.navLink}
          >
            <span className={styles.navIcon}>📝</span>
            Bài tập
          </Link>
          <Link 
            to="/teacher/exams" 
            className={location.pathname === '/teacher/exams' ? styles.navLinkActive : styles.navLink}
          >
            <span className={styles.navIcon}>📋</span>
            Bài kiểm tra
          </Link>
          <Link 
            to="/teacher/grades" 
            className={location.pathname === '/teacher/grades' ? styles.navLinkActive : styles.navLink}
          >
            <span className={styles.navIcon}>📈</span>
            Bảng điểm
          </Link>
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
              <div className={styles.userRole}>Giáo viên</div>
            </div>
          </div>
          <Link to="/" className={styles.homeBtn}>
            <span>🏠</span> Home
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}

export default TeacherLayout
