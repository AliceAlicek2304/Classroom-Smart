import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import styles from './AdminDashboard.module.css'

const AdminDashboard = () => {
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
            <div className={styles.statValue}>12</div>
            <div className={styles.statChange}>+2 this month</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>📖</div>
            <div className={styles.statLabel}>Total Textbooks</div>
            <div className={styles.statValue}>48</div>
            <div className={styles.statChange}>+5 this month</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>🏫</div>
            <div className={styles.statLabel}>Active Classrooms</div>
            <div className={styles.statValue}>24</div>
            <div className={styles.statChange}>+3 this month</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orange}`}>👨‍🎓</div>
            <div className={styles.statLabel}>Total Students</div>
            <div className={styles.statValue}>856</div>
            <div className={styles.statChange}>+42 this month</div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Recent Activities</h2>
              <button className={styles.viewAllBtn}>View All</button>
            </div>
            <ul className={styles.activityList}>
              <li className={styles.activityItem}>
                <div className={styles.activityIcon}>📚</div>
                <div className={styles.activityContent}>
                  <h4>New subject created</h4>
                  <p>Mathematics Grade 10 was added</p>
                </div>
                <span style={{ color: '#718096', fontSize: '0.875rem' }}>2h ago</span>
              </li>
              <li className={styles.activityItem}>
                <div className={styles.activityIcon}>🏫</div>
                <div className={styles.activityContent}>
                  <h4>Classroom updated</h4>
                  <p>Class 10A schedule changed</p>
                </div>
                <span style={{ color: '#718096', fontSize: '0.875rem' }}>5h ago</span>
              </li>
              <li className={styles.activityItem}>
                <div className={styles.activityIcon}>📖</div>
                <div className={styles.activityContent}>
                  <h4>New textbook added</h4>
                  <p>Physics Textbook Grade 11</p>
                </div>
                <span style={{ color: '#718096', fontSize: '0.875rem' }}>1d ago</span>
              </li>
              <li className={styles.activityItem}>
                <div className={styles.activityIcon}>👨‍🎓</div>
                <div className={styles.activityContent}>
                  <h4>Students enrolled</h4>
                  <p>15 new students joined Class 9B</p>
                </div>
                <span style={{ color: '#718096', fontSize: '0.875rem' }}>2d ago</span>
              </li>
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
