import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import dashboardAPI, { type DashboardStats, type RecentActivity } from '../../services/dashboardService'
import { useCountUp } from '../../hooks/useCountUp'
import styles from './AdminDashboard.module.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await dashboardAPI.getStats()
        setStats(response.data.data)
      } catch {
        // failed silently
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'SUBJECT': return '📚'
      case 'TEXTBOOK': return '📖'
      case 'CLASSROOM': return '🏫'
      case 'STUDENT': return '👨‍🎓'
      default: return '🔔'
    }
  }

  const animSubjects    = useCountUp(stats?.totalSubjects    ?? 0)
  const animTextbooks   = useCountUp(stats?.totalTextbooks   ?? 0)
  const animClassrooms  = useCountUp(stats?.activeClassrooms ?? 0)
  const animStudents    = useCountUp(stats?.totalStudents    ?? 0)
  const animAssignments = useCountUp(stats?.totalAssignments ?? 0)
  const animExams       = useCountUp(stats?.totalExams       ?? 0)
  const animSubmissions = useCountUp(stats?.totalSubmissions ?? 0)

  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>Tổng quan hệ thống</h1>
          <p>Xin chào! Đây là tình trạng của nền tảng hôm nay.</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purple}`}>📚</div>
            <div className={styles.statLabel}>Tổng môn học</div>
            <div className={styles.statValue}>
              {loading ? '…' : animSubjects}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>📖</div>
            <div className={styles.statLabel}>Tổng sách giáo khoa</div>
            <div className={styles.statValue}>
              {loading ? '…' : animTextbooks}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>🏫</div>
            <div className={styles.statLabel}>Lớp đang hoạt động</div>
            <div className={styles.statValue}>
              {loading ? '…' : animClassrooms}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orange}`}>👨‍🎓</div>
            <div className={styles.statLabel}>Tổng học sinh</div>
            <div className={styles.statValue}>
              {loading ? '…' : animStudents}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.red}`}>📝</div>
            <div className={styles.statLabel}>Bài tập</div>
            <div className={styles.statValue}>
              {loading ? '…' : animAssignments}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.teal}`}>📋</div>
            <div className={styles.statLabel}>Bài kiểm tra</div>
            <div className={styles.statValue}>
              {loading ? '…' : animExams}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.indigo}`}>📤</div>
            <div className={styles.statLabel}>Bài đã nộp</div>
            <div className={styles.statValue}>
              {loading ? '…' : animSubmissions}
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Hoạt động gần đây</h2>
              <button className={styles.viewAllBtn}>Xem tất cả</button>
            </div>
            <ul className={styles.activityList}>
              {loading ? (
                <li className={styles.activityItem}>Đang tải...</li>
              ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, index) => (
                  <li key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className={styles.activityContent}>
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                    </div>
                    <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: vi })}
                    </span>
                  </li>
                ))
              ) : (
                <li className={styles.activityItem}>Chưa có hoạt động nào gần đây.</li>
              )}
            </ul>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Thao tác nhanh</h2>
            </div>
            <div className={styles.quickActions}>
              <Link to="/admin/subjects" className={styles.actionBtn}>
                <span className={styles.actionIcon}>📚</span>
                Thêm môn học
              </Link>
              <Link to="/admin/textbooks" className={styles.actionBtn}>
                <span className={styles.actionIcon}>📖</span>
                Thêm sách giáo khoa
              </Link>
              <Link to="/admin/classrooms" className={styles.actionBtn}>
                <span className={styles.actionIcon}>🏫</span>
                Tạo lớp học
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
