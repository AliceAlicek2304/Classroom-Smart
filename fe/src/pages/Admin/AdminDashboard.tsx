import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import dashboardAPI, { type DashboardStats, type RecentActivity } from '../../services/dashboardService'
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
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
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

  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your platform today.</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purple}`}>📚</div>
            <div className={styles.statLabel}>Total Subjects</div>
            <div className={styles.statValue}>
              {loading ? '...' : stats?.totalSubjects || 0}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>📖</div>
            <div className={styles.statLabel}>Total Textbooks</div>
            <div className={styles.statValue}>
              {loading ? '...' : stats?.totalTextbooks || 0}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>🏫</div>
            <div className={styles.statLabel}>Active Classrooms</div>
            <div className={styles.statValue}>
              {loading ? '...' : stats?.activeClassrooms || 0}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orange}`}>👨‍🎓</div>
            <div className={styles.statLabel}>Total Students</div>
            <div className={styles.statValue}>
              {loading ? '...' : stats?.totalStudents || 0}
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Recent Activities</h2>
              <button className={styles.viewAllBtn}>View All</button>
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
              <h2>Quick Actions</h2>
            </div>
            <div className={styles.quickActions}>
              <Link to="/admin/subjects" className={styles.actionBtn}>
                <span className={styles.actionIcon}>📚</span>
                Add New Subject
              </Link>
              <Link to="/admin/textbooks" className={styles.actionBtn}>
                <span className={styles.actionIcon}>📖</span>
                Add New Textbook
              </Link>
              <Link to="/admin/classrooms" className={styles.actionBtn}>
                <span className={styles.actionIcon}>🏫</span>
                Create Classroom
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
