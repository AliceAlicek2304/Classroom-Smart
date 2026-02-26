import { useState, useEffect } from 'react'
import { TableSkeleton } from '../../../components/Skeleton'
import { EmptyState } from '../../../components/EmptyState'
import classroomAPI, { type Classroom } from '../../../services/classroomService'
import gradeAPI, { type GradeBookResponse, GRADE_TYPE_LABELS, GRADE_TYPE_COLORS } from '../../../services/gradeService'
import { useToast } from '../../../components/Toast'
import styles from '../../Admin/Admin.module.css'

const CustomerGradesTab = () => {
  const toast = useToast()

  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([])
  const [myLoading, setMyLoading] = useState(false)
  const [gradesClassroomId, setGradesClassroomId] = useState<number | null>(null)
  const [gradeBook, setGradeBook] = useState<GradeBookResponse | null>(null)
  const [gradesLoading, setGradesLoading] = useState(false)

  useEffect(() => {
    setMyLoading(true)
    classroomAPI.getEnrolled()
      .then(res => setMyClassrooms(res.data.data || []))
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } }
        toast.error(e.response?.data?.message || 'Lỗi khi tải danh sách lớp')
      })
      .finally(() => setMyLoading(false))
  }, [])

  const fetchGrades = async (classroomId: number) => {
    setGradesClassroomId(classroomId)
    setGradesLoading(true)
    setGradeBook(null)
    try {
      const res = await gradeAPI.getMyGradeBook(classroomId)
      setGradeBook(res.data.data)
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi tải bảng điểm')
    } finally {
      setGradesLoading(false)
    }
  }

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '#aaa'
    if (score >= 8) return '#22c55e'
    if (score >= 5) return '#f59e0b'
    return '#ef4444'
  }

  if (myLoading) return <TableSkeleton cols={3} rows={3} />

  if (myClassrooms.filter(c => c.isActive).length === 0) {
    return (
      <EmptyState
        icon="🏫"
        title="Chưa tham gia lớp học nào"
        message="Đăng ký lớp học để xem bảng điểm."
      />
    )
  }

  return (
    <div>
      <div className={styles.filterBar} style={{ marginBottom: 20 }}>
        <select
          value={gradesClassroomId ?? ''}
          onChange={e => {
            if (e.target.value) {
              fetchGrades(Number(e.target.value))
            } else {
              setGradesClassroomId(null)
              setGradeBook(null)
            }
          }}
          className={styles.filterSelect}
          style={{ minWidth: 260 }}
        >
          <option value="">— Chọn lớp học —</option>
          {myClassrooms.filter(c => c.isActive).map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.subjectName})</option>
          ))}
        </select>
      </div>

      {!gradesClassroomId && (
        <EmptyState icon="📋" title="Chọn lớp để xem bảng điểm" message="Chọn một lớp học ở trên để xem bảng điểm của bạn." />
      )}

      {gradesClassroomId && gradesLoading && <TableSkeleton cols={3} rows={4} />}

      {gradesClassroomId && !gradesLoading && gradeBook && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>Cột điểm</th>
                <th>Loại</th>
                <th style={{ textAlign: 'center', minWidth: 80 }}>Điểm</th>
              </tr>
            </thead>
            <tbody>
              {gradeBook.columns.map(col => {
                const myRow = gradeBook.rows[0]
                const entry = myRow?.grades.find(g => g.columnId === col.id)
                return (
                  <tr key={col.id}>
                    <td><strong>{col.name}</strong></td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '0.15rem 0.55rem',
                        background: GRADE_TYPE_COLORS[col.type] || '#eee',
                        border: '1.5px solid var(--dark)', borderRadius: 6,
                        fontSize: '0.78rem', fontWeight: 700,
                      }}>
                        {GRADE_TYPE_LABELS[col.type] || col.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', color: getScoreColor(entry?.score) }}>
                      {entry?.score !== null && entry?.score !== undefined
                        ? entry.score
                        : <span style={{ color: '#ccc', fontWeight: 400 }}>—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p style={{ marginTop: 12, fontSize: '0.82rem', color: '#888' }}>
            Tổng {gradeBook.columns.length} cột điểm · Lớp: {gradeBook.classroomName}
          </p>
        </div>
      )}
    </div>
  )
}

export default CustomerGradesTab
