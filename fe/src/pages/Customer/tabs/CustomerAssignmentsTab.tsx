import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TableSkeleton } from '../../../components/Skeleton'
import { EmptyState } from '../../../components/EmptyState'
import classroomAPI, { type Classroom } from '../../../services/classroomService'
import assignmentAPI, { type AssignmentResponse } from '../../../services/assignmentService'
import examAPI, { type ExamResponse } from '../../../services/examService'
import { useToast } from '../../../components/Toast'
import styles from '../../Admin/Admin.module.css'

const CustomerAssignmentsTab = () => {
  const toast = useToast()
  const navigate = useNavigate()

  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([])
  const [myLoading, setMyLoading] = useState(false)
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null)
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([])
  const [exams, setExams] = useState<ExamResponse[]>([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)

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

  const fetchAssignments = async (classroomId: number) => {
    setSelectedClassroomId(classroomId)
    setAssignmentsLoading(true)
    try {
      const [aRes, eRes] = await Promise.all([
        assignmentAPI.getByClassroom(classroomId),
        examAPI.getByClassroom(classroomId),
      ])
      setAssignments(((aRes.data.data || []) as AssignmentResponse[]).filter(a => a.isActive))
      setExams(((eRes.data.data || []) as ExamResponse[]).filter(e => e.isActive))
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi tải bài tập')
    } finally {
      setAssignmentsLoading(false)
    }
  }

  if (myLoading) return <TableSkeleton cols={3} rows={3} />

  if (myClassrooms.filter(c => c.isActive).length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="Chưa tham gia lớp học nào"
        message="Đăng ký lớp học để xem bài tập và kiểm tra."
      />
    )
  }

  return (
    <div>
      <div className={styles.filterBar} style={{ marginBottom: 20 }}>
        <select
          value={selectedClassroomId ?? ''}
          onChange={e => e.target.value ? fetchAssignments(Number(e.target.value)) : setSelectedClassroomId(null)}
          className={styles.filterSelect}
          style={{ minWidth: 220 }}
        >
          <option value="">— Chọn lớp học —</option>
          {myClassrooms.filter(c => c.isActive).map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.subjectName})</option>
          ))}
        </select>
      </div>

      {!selectedClassroomId && (
        <EmptyState icon="📚" title="Chọn lớp để xem bài" message="Chọn một lớp học ở trên để xem bài tập và bài kiểm tra." />
      )}

      {selectedClassroomId && assignmentsLoading && <TableSkeleton cols={4} rows={4} />}

      {selectedClassroomId && !assignmentsLoading && (
        <>
          {/* Assignments */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 12, borderBottom: '2px solid var(--dark)', paddingBottom: 6 }}>
              📝 Bài tập ({assignments.length})
            </h3>
            {assignments.length === 0 ? (
              <div className={styles.empty} style={{ padding: '1rem 0' }}>
                <p>Chưa có bài tập nào cho lớp này.</p>
              </div>
            ) : (
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Tiêu đề</th><th>Số câu</th><th>Hạn nộp</th><th>Hành động</th></tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => {
                      const isOverdue = a.dueDate ? new Date(a.dueDate) < new Date() : false
                      return (
                        <tr key={a.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{a.title}</div>
                            {a.description && (
                              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                {a.description.slice(0, 80)}{a.description.length > 80 ? '…' : ''}
                              </div>
                            )}
                          </td>
                          <td>{a.totalQuestions} câu</td>
                          <td>
                            {a.dueDate
                              ? <span style={{ color: isOverdue ? '#DC2626' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
                                  {new Date(a.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  {isOverdue ? ' (Hết hạn)' : ''}
                                </span>
                              : <span className={styles.cellMuted}>—</span>}
                          </td>
                          <td>
                            {isOverdue ? (
                              a.hasSubmitted ? (
                                <button className={styles.btnCreate} style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', background: 'var(--dark)', color: '#fff' }}
                                  onClick={() => navigate(`/customer/assignment/${a.id}`)}>
                                  📖 Xem kết quả
                                </button>
                              ) : <span style={{ color: '#DC2626', fontSize: '0.8rem', fontWeight: 700 }}>⏰ Hết hạn</span>
                            ) : a.hasSubmitted ? (
                              <button className={styles.btnCreate} style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', background: 'var(--purple)', color: '#fff' }}
                                onClick={() => navigate(`/customer/assignment/${a.id}`)}>
                                ✅ Đã nộp
                              </button>
                            ) : (
                              <button className={styles.btnCreate} style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
                                onClick={() => navigate(`/customer/assignment/${a.id}`)}>
                                ✍️ Làm bài
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Exams */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 12, borderBottom: '2px solid var(--dark)', paddingBottom: 6 }}>
              📋 Bài kiểm tra ({exams.length})
            </h3>
            {exams.length === 0 ? (
              <div className={styles.empty} style={{ padding: '1rem 0' }}>
                <p>Chưa có bài kiểm tra nào cho lớp này.</p>
              </div>
            ) : (
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Tiêu đề</th><th>Số câu</th><th>Thời gian</th><th>Hạn thi</th><th>Hành động</th></tr>
                  </thead>
                  <tbody>
                    {exams.map(ex => {
                      const overdue = ex.dueDate ? new Date(ex.dueDate) < new Date() : false
                      const submitted = ex.hasSubmitted === true
                      return (
                        <tr key={ex.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ex.title}</div>
                            {ex.description && (
                              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                {ex.description.slice(0, 80)}{ex.description.length > 80 ? '…' : ''}
                              </div>
                            )}
                          </td>
                          <td>{ex.totalQuestions} câu</td>
                          <td>{ex.duration} phút</td>
                          <td>
                            {ex.dueDate
                              ? new Date(ex.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : <span className={styles.cellMuted}>—</span>}
                          </td>
                          <td>
                            {!submitted && overdue ? (
                              <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.82rem' }}>⏰ Hết hạn</span>
                            ) : submitted && overdue ? (
                              <button className={styles.btnCreate} style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', background: 'var(--dark)', color: '#fff' }}
                                onClick={() => navigate(`/customer/exam/${ex.id}`)}>
                                📖 Xem kết quả
                              </button>
                            ) : submitted ? (
                              <button className={styles.btnCreate} style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', background: 'var(--purple)', color: '#fff' }}
                                onClick={() => navigate(`/customer/exam/${ex.id}`)}>
                                ✅ Đã nộp
                              </button>
                            ) : (
                              <button className={styles.btnCreate} style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
                                onClick={() => navigate(`/customer/exam/${ex.id}`)}>
                                ▶️ Bắt đầu thi
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CustomerAssignmentsTab
