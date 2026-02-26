import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import CustomerClassroomsTab from './tabs/CustomerClassroomsTab'
import CustomerDocsTab from './tabs/CustomerDocsTab'
import CustomerAssignmentsTab from './tabs/CustomerAssignmentsTab'
import CustomerGradesTab from './tabs/CustomerGradesTab'
import profile from '../Common/ProfilePage.module.css'

type TabType = 'mine' | 'all' | 'docs' | 'assignments' | 'grades'

const getTabFromPath = (pathname: string): TabType => {
  if (pathname === '/customer/classrooms') return 'all'
  if (pathname === '/customer/docs') return 'docs'
  if (pathname === '/customer/assignments') return 'assignments'
  if (pathname === '/customer/grades') return 'grades'
  return 'mine'
}

const TAB_HEADERS: Record<TabType, { icon: string; title: string; subtitle: string }> = {
  mine:        { icon: '🎒', title: 'Lớp của tôi',           subtitle: 'Các lớp học bạn đang tham gia' },
  all:         { icon: '🏫', title: 'Tất cả các lớp',        subtitle: 'Khám phá và đăng ký lớp học phù hợp với bạn' },
  docs:        { icon: '📖', title: 'Tài liệu',              subtitle: 'Sách giáo khoa đang hoạt động' },
  assignments: { icon: '📝', title: 'Bài tập & Kiểm tra',   subtitle: 'Chọn lớp học để xem bài tập và bài kiểm tra' },
  grades:      { icon: '📈', title: 'Bảng điểm',             subtitle: 'Xem điểm số của bạn theo từng lớp học' },
}

const CustomerClassroomsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>(() => getTabFromPath(location.pathname))

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname))
  }, [location.pathname])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    const paths: Record<TabType, string> = {
      mine:        '/customer/my-classrooms',
      all:         '/customer/classrooms',
      docs:        '/customer/docs',
      assignments: '/customer/assignments',
      grades:      '/customer/grades',
    }
    navigate(paths[tab])
  }

  const { icon, title, subtitle } = TAB_HEADERS[activeTab]

  return (
    <div className={profile.profileWrapper}>
      <Header />

      <main className={profile.profileContent}>
        {/* Sidebar */}
        <aside className={profile.internalSidebar}>
          <div className={profile.sidebarTitle}>📚 Khóa học</div>
          <nav className={profile.sidebarNav}>
            {([
              ['mine',        '🎒', 'Lớp của tôi'],
              ['all',         '🏫', 'Tất cả các lớp'],
              ['docs',        '📖', 'Tài liệu'],
              ['assignments', '📝', 'Bài tập & Kiểm tra'],
              ['grades',      '📈', 'Bảng điểm'],
            ] as [TabType, string, string][]).map(([tab, navIcon, label]) => (
              <div
                key={tab}
                className={`${profile.navItem} ${activeTab === tab ? profile.navItemActive : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                <span className={profile.navIcon}>{navIcon}</span>
                {label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main panel */}
        <section>
          <div className={profile.mainPanel}>
            <div className={profile.panelHeader}>
              <h2>{icon} {title}</h2>
              <p>{subtitle}</p>
            </div>

            {activeTab === 'mine'        && <CustomerClassroomsTab mode="mine" />}
            {activeTab === 'all'         && <CustomerClassroomsTab mode="all" />}
            {activeTab === 'docs'        && <CustomerDocsTab />}
            {activeTab === 'assignments' && <CustomerAssignmentsTab />}
            {activeTab === 'grades'      && <CustomerGradesTab />}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default CustomerClassroomsPage
