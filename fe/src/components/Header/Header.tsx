import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { useToast } from '../Toast'
import { AuthModal } from '../Auth'
import styles from './Header.module.css'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [authModal, setAuthModal] = useState<{isOpen: boolean, mode: 'login' | 'register'}>({
    isOpen: false,
    mode: 'login'
  })
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    toast.success('Đăng xuất thành công!')
    navigate('/')
  }

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModal({ isOpen: true, mode })
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>🎓</div>
            <span className={styles.logoText}>Classroom Smart</span>
          </Link>

          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>Courses</Link>
            <Link to="/" className={styles.navLink}>Teachers</Link>
            <Link to="/" className={styles.navLink}>Pricing</Link>
            <Link to="/" className={styles.navLink}>About</Link>
          </nav>

          {isAuthenticated && user ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button 
                className={styles.avatarButton}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.avatar ? (
                  <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080${user.avatar}`} alt={user.fullName} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {getInitials(user.fullName)}
                  </div>
                )}
              </button>
              
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>
                      {user.avatar ? (
                        <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080${user.avatar}`} alt={user.fullName} />
                      ) : (
                        <span>{getInitials(user.fullName)}</span>
                      )}
                    </div>
                    <div className={styles.dropdownInfo}>
                      <span className={styles.dropdownName}>{user.fullName}</span>
                      <span className={styles.dropdownEmail}>{user.email}</span>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <span className={styles.dropdownIcon}>👑</span>
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'TEACHER' && (
                    <Link to="/teacher" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <span className={styles.dropdownIcon}>🎓</span>
                      Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <span className={styles.dropdownIcon}>👤</span>
                    Hồ sơ của tôi
                  </Link>
                  {user.role === 'CUSTOMER' && (
                    <Link to="/customer/my-classrooms" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <span className={styles.dropdownIcon}>📚</span>
                      Khóa học của tôi
                    </Link>
                  )}
                  <Link to="/settings" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <span className={styles.dropdownIcon}>⚙️</span>
                    Cài đặt
                  </Link>
                  <div className={styles.dropdownDivider}></div>
                  <button className={styles.dropdownLogout} onClick={handleLogout}>
                    <span className={styles.dropdownIcon}>🚪</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <button 
                onClick={() => openAuthModal('login')} 
                className={styles.btnLogin}
              >
                Log In
              </button>
              <button 
                onClick={() => openAuthModal('register')} 
                className={styles.btnRegister}
              >
                Start Free
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialMode={authModal.mode}
      />
    </>
  )
}

export default Header
