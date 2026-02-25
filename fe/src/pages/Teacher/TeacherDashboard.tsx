import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts'
import TeacherLayout from '../../components/TeacherLayout/TeacherLayout'
import classroomAPI, { type Classroom } from '../../services/classroomService'
import { useCountUp } from '../../hooks/useCountUp'
import styles from './TeacherDashboard.module.css'

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyClassrooms()
  }, [])

  const fetchMyClassrooms = async () => {
    try {
      setLoading(true)
      const response = await classroomAPI.getMyClassrooms()
      setClassrooms(response.data.data || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const activeClassrooms = classrooms.filter(c => c.isActive)
  const totalStudents = classrooms.reduce((sum, c) => sum + (c.studentCount || 0), 0)
  const totalSubjects = new Set(classrooms.map(c => c.subjectName)).size

  const animTotal    = useCountUp(classrooms.length)
  const animActive   = useCountUp(activeClassrooms.length)
  const animStudents = useCountUp(totalStudents)
  const animSubjects = useCountUp(totalSubjects)

  return (
    <TeacherLayout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <p>Chào mừng trở lại, {user?.fullName}!</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purple}`}>🏫</div>
            <div className={styles.statLabel}>Tổng số lớp</div>
            <div className={styles.statValue}>{animTotal}</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>✅</div>
            <div className={styles.statLabel}>Lớp đang hoạt động</div>
            <div className={styles.statValue}>{animActive}</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>👥</div>
            <div className={styles.statLabel}>Tổng học sinh</div>
            <div className={styles.statValue}>{animStudents}</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orange}`}>📚</div>
            <div className={styles.statLabel}>Môn học</div>
            <div className={styles.statValue}>{animSubjects}</div>
          </div>
        </div>

        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Thao tác nhanh</h2>
          <div className={styles.actionGrid}>
            <Link to="/teacher/classrooms" className={styles.actionCard}>
              <span className={styles.actionIconBox}>🏫</span>
              Quản lý lớp học
            </Link>
            <Link to="/teacher/assignments" className={styles.actionCard}>
              <span className={styles.actionIconBox}>📝</span>
              Bài tập
            </Link>
            <Link to="/teacher/exams" className={styles.actionCard}>
              <span className={styles.actionIconBox}>📋</span>
              Bài kiểm tra
            </Link>
          </div>
        </div>

        <div className={styles.recentClasses}>
          <h2 className={styles.sectionTitle}>Lớp học gần đây</h2>
          {loading ? (
            <div className={styles.loading}>Đang tải...</div>
          ) : classrooms.length === 0 ? (
            <div className={styles.empty}>
              <p>Bạn chưa có lớp học nào.</p>
              <Link to="/teacher/classrooms" className={styles.createBtn}>
                Tạo lớp học đầu tiên
              </Link>
            </div>
          ) : (
            <div className={styles.classGrid}>
              {classrooms.slice(0, 4).map((classroom) => (
                <div key={classroom.id} className={styles.classCard}>
                  <div className={styles.classHeader}>
                    <h3 className={styles.className}>{classroom.name}</h3>
                    <span className={classroom.isActive ? styles.badgeActive : styles.badgeInactive}>
                      {classroom.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                  <div className={styles.classInfo}>
                    <div className={styles.classInfoItem}>
                      <span className={styles.classInfoLabel}>Môn học:</span>
                      <span className={styles.classInfoValue}>{classroom.subjectName}</span>
                    </div>
                    <div className={styles.classInfoItem}>
                      <span className={styles.classInfoLabel}>Khối:</span>
                      <span className={styles.classInfoValue}>{classroom.gradeLevel}</span>
                    </div>
                    <div className={styles.classInfoItem}>
                      <span className={styles.classInfoLabel}>Năm học:</span>
                      <span className={styles.classInfoValue}>{classroom.schoolYear}</span>
                    </div>
                    <div className={styles.classInfoItem}>
                      <span className={styles.classInfoLabel}>Học sinh:</span>
                      <span className={styles.classInfoValue}>{classroom.studentCount || 0} học sinh</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  )
}

export default TeacherDashboard
