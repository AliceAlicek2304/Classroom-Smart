import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts'
import { authAPI } from '../../services/authService'
import { useToast } from '../../components/Toast'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import styles from './ProfilePage.module.css'

type TabType = 'basic' | 'security'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Basic Info Form State
  const [formData, setFormData] = useState({
    fullName: '',
    birthDay: '',
    email: ''
  })

  // Avatar State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Security Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        birthDay: user.birthDay || '',
        email: user.email || ''
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [user])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('Ảnh phải nhỏ hơn 2MB!')
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile) return
    
    setLoading(true)
    try {
      const response = await authAPI.uploadAvatar(selectedFile)
      if (response.success) {
        toast.success('Cập nhật ảnh đại diện thành công!')
        updateUser({ ...user!, avatar: response.data })
        setSelectedFile(null)
      } else {
        toast.error(response.message || 'Tải ảnh lên thất bại')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải ảnh lên!')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authAPI.updateProfile(formData)
      if (response.success) {
        toast.success(response.message || 'Cập nhật thành công!')
        updateUser({ ...user!, ...response.data })
      } else {
        toast.error(response.message || 'Cập nhật thất bại')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp!')
    }
    
    setLoading(true)
    try {
      const response = await authAPI.changePassword(passwordData.oldPassword, passwordData.newPassword)
      if (response.success) {
        toast.success(response.message || 'Đổi mật khẩu thành công!')
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(response.message || 'Đổi mật khẩu thất bại')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!')
    } finally {
      setLoading(false)
    }
  }

  const renderBasicInfo = () => (
    <div className={styles.mainPanel}>
      <div className={styles.panelHeader}>
        <h2>👤 Thông tin cơ bản</h2>
        <p>Quản lý thông tin hồ sơ của bạn</p>
      </div>

      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer} onClick={handleAvatarClick}>
          {avatarPreview ? (
            <img src={avatarPreview.startsWith('data:') ? avatarPreview : `http://localhost:8080${avatarPreview}`} alt="Avatar" className={styles.avatarImage} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {getInitials(user?.fullName)}
            </div>
          )}
          <div className={styles.avatarOverlay}>
            <span>📷</span>
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleAvatarChange}
        />
        <div className={styles.avatarHint}>Nhấn để đổi ảnh đại diện</div>
        {selectedFile && (
          <button 
            type="button" 
            className={styles.submitBtn} 
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
            onClick={handleAvatarUpload}
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Hoàn tất đổi ảnh'}
          </button>
        )}
      </div>
      
      <form onSubmit={handleProfileSubmit} className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleFormChange}
            required
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Ngày sinh</label>
          <input
            type="date"
            name="birthDay"
            value={formData.birthDay}
            onChange={handleFormChange}
            className={styles.input}
          />
        </div>
        
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            required
            className={styles.input}
          />
        </div>
        
        <div className={styles.fullWidth}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )

  const renderSecurity = () => (
    <div className={styles.mainPanel}>
      <div className={styles.panelHeader}>
        <h2>🔒 Bảo mật</h2>
        <p>Cập nhật mật khẩu để bảo vệ tài khoản</p>
      </div>
      
      <form onSubmit={handlePasswordSubmit} className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>Mật khẩu hiện tại</label>
          <input
            type="password"
            name="oldPassword"
            value={passwordData.oldPassword}
            onChange={handlePasswordChange}
            required
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            minLength={6}
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Xác nhận mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            className={styles.input}
          />
        </div>
        
        <div className={styles.fullWidth}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang cập nhật...' : '🔑 Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div className={styles.profileWrapper}>
      <Header />
      
      <main className={styles.profileContent}>
        <aside className={styles.internalSidebar}>
          <div className={styles.sidebarTitle}>Cài đặt tài khoản</div>
          <nav className={styles.sidebarNav}>
            <div 
              className={`${styles.navItem} ${activeTab === 'basic' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              <span className={styles.navIcon}>👤</span>
              Thông tin cơ bản
            </div>
            <div 
              className={`${styles.navItem} ${activeTab === 'security' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className={styles.navIcon}>🔒</span>
              Bảo mật
            </div>
          </nav>
        </aside>
        
        <section>
          {activeTab === 'basic' ? renderBasicInfo() : renderSecurity()}
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default ProfilePage
