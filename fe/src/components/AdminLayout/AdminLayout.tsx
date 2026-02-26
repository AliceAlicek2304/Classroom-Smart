import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { useToast } from '../Toast'
import styles from './AdminLayout.module.css'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

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
    <div className={styles.adminLayout}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <button className={styles.sidebarClose} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">✕</button>
        <div className={styles.sidebarHeader}>
          <Link to="/admin" className={styles.logo}>
            <div className={styles.logoIcon}>🎓</div>
            <div>
              <div className={styles.logoText}>Classroom Smart</div>
              <div className={styles.logoSubtext}>Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.navLabel}>Main</div>
            <Link 
              to="/admin" 
              className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📊</span>
              Dashboard
            </Link>
          </div>

          <div className={styles.navSection}>
            <div className={styles.navLabel}>Content Management</div>
            <Link 
              to="/admin/subjects" 
              className={`${styles.navLink} ${isActive('/admin/subjects') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📚</span>
              Subjects
            </Link>
            <Link 
              to="/admin/textbooks" 
              className={`${styles.navLink} ${isActive('/admin/textbooks') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📖</span>
              Textbooks
            </Link>
          </div>

          <div className={styles.navSection}>
            <div className={styles.navLabel}>Classroom Management</div>
            <Link 
              to="/admin/classrooms" 
              className={`${styles.navLink} ${isActive('/admin/classrooms') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>🏫</span>
              Classrooms
            </Link>
            <Link 
              to="/admin/students" 
              className={`${styles.navLink} ${isActive('/admin/students') ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>👨‍🎓</span>
              Students
            </Link>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.avatar ? (
                <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080${user.avatar}`} alt={user.fullName} className={styles.avatarImg} />
              ) : (
                getInitials(user?.fullName)
              )}
            </div>
            <div className={styles.userName}>
              <h4>{user?.fullName}</h4>
              <p>{user?.role}</p>
            </div>
          </div>
          <Link to="/" className={styles.homeBtn}>
            <span>🏠</span>
            Home
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <button className={styles.hamburger} onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          ☰
        </button>
        {children}
      </main>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

export default AdminLayout
