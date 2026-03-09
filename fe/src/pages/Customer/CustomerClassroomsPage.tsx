import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import StudentLayout from '../../components/StudentLayout/StudentLayout'
import CustomerClassroomsTab from './tabs/CustomerClassroomsTab'
import CustomerDocsTab from './tabs/CustomerDocsTab'
import CustomerAssignmentsTab from './tabs/CustomerAssignmentsTab'
import CustomerGradesTab from './tabs/CustomerGradesTab'
import styles from '../Admin/Admin.module.css'

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
  const [activeTab, setActiveTab] = useState<TabType>(() => getTabFromPath(location.pathname))

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname))
  }, [location.pathname])

  const { icon, title, subtitle } = TAB_HEADERS[activeTab]

  return (
    <StudentLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{icon} {title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>

        <div className={styles.card}>
          {activeTab === 'mine'        && <CustomerClassroomsTab mode="mine" />}
          {activeTab === 'all'         && <CustomerClassroomsTab mode="all" />}
          {activeTab === 'docs'        && <CustomerDocsTab />}
          {activeTab === 'assignments' && <CustomerAssignmentsTab />}
          {activeTab === 'grades'      && <CustomerGradesTab />}
        </div>
      </div>
    </StudentLayout>
  )
}

export default CustomerClassroomsPage
