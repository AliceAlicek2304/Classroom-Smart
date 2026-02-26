import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TableSkeleton } from '../../../components/Skeleton'
import { EmptyState } from '../../../components/EmptyState'
import classroomAPI, { type Classroom } from '../../../services/classroomService'
import subjectAPI, { type Subject } from '../../../services/subjectService'
import { useToast } from '../../../components/Toast'
import styles from '../../Admin/Admin.module.css'

interface Props {
  mode: 'mine' | 'all'
}

const CustomerClassroomsTab = ({ mode }: Props) => {
  const toast = useToast()
  const navigate = useNavigate()

  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([])
  const [myLoading, setMyLoading] = useState(false)
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [allLoading, setAllLoading] = useState(false)

  const [filterSubject, setFilterSubject] = useState('')
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterSchoolYear, setFilterSchoolYear] = useState('')

  const [enrollTarget, setEnrollTarget] = useState<Classroom | null>(null)
  const [enrollPassword, setEnrollPassword] = useState('')
  const [enrollLoading, setEnrollLoading] = useState(false)

  const fetchMine = async () => {
    setMyLoading(true)
    try {
      const res = await classroomAPI.getEnrolled()
      setMyClassrooms(res.data.data || [])
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi tải danh sách lớp')
    } finally {
      setMyLoading(false)
    }
  }

  const fetchAll = async () => {
    setAllLoading(true)
    try {
      const [classroomsRes, subjectsRes] = await Promise.all([
        classroomAPI.getAll(),
        subjectAPI.getActive(),
      ])
      setAllClassrooms(
        ((classroomsRes.data.data || []) as Classroom[]).filter(c => c.isActive)
      )
      setSubjects((subjectsRes as { data: Subject[] }).data || [])
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi tải danh sách lớp')
    } finally {
      setAllLoading(false)
    }
  }

  useEffect(() => {
    setFilterSubject('')
    setFilterTeacher('')
    setFilterGrade('')
    setFilterSchoolYear('')
    if (mode === 'mine') {
      fetchMine()
    } else {
      fetchMine()
      fetchAll()
    }
  }, [mode])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollTarget) return
    try {
      setEnrollLoading(true)
      await classroomAPI.enroll(enrollTarget.id, enrollPassword)
      toast.success(`Đăng ký lớp "${enrollTarget.name}" thành công! 🎉`)
      setEnrollTarget(null)
      setEnrollPassword('')
      fetchMine()
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setEnrollLoading(false)
    }
  }

  const currentList = mode === 'mine' ? myClassrooms.filter(c => c.isActive) : allClassrooms

  const uniqueSubjects = mode === 'all'
    ? subjects.map(s => s.name)
    : [...new Set(currentList.map(c => c.subjectName))].filter(Boolean).sort()
  const uniqueTeachers = [...new Set(currentList.map(c => c.teacherName))].filter(Boolean).sort()
  const uniqueYears = [...new Set(currentList.map(c => c.schoolYear))].filter(Boolean).sort()

  const filtered = currentList.filter(c => {
    if (filterSubject && c.subjectName !== filterSubject) return false
    if (filterTeacher && c.teacherName !== filterTeacher) return false
    if (filterGrade && String(c.gradeLevel) !== filterGrade) return false
    if (filterSchoolYear && c.schoolYear !== filterSchoolYear) return false
    return true
  })

  const hasFilter = filterSubject || filterTeacher || filterGrade || filterSchoolYear
  const loading = mode === 'mine' ? myLoading : allLoading

  const resetFilters = () => {
    setFilterSubject('')
    setFilterTeacher('')
    setFilterGrade('')
    setFilterSchoolYear('')
  }

  return (
    <>
      <div className={styles.filterBar}>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className={styles.filterSelect}>
          <option value="">Tất cả môn</option>
          {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)} className={styles.filterSelect}>
          <option value="">Tất cả GV</option>
          {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className={styles.filterSelect}>
          <option value="">Tất cả khối</option>
          {['6', '7', '8', '9'].map(g => <option key={g} value={g}>Khối {g}</option>)}
        </select>
        <select value={filterSchoolYear} onChange={e => setFilterSchoolYear(e.target.value)} className={styles.filterSelect}>
          <option value="">Tất cả năm</option>
          {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {hasFilter && <button className={styles.btnReset} onClick={resetFilters}>✕ Xóa bộ lọc</button>}
      </div>

      {loading ? (
        <TableSkeleton cols={7} rows={5} />
      ) : filtered.length === 0 ? (
        mode === 'mine' ? (
          <EmptyState
            icon="🏫"
            title="Chưa có lớp nào"
            message={hasFilter ? 'Không có lớp nào khớp với bộ lọc.' : 'Bạn chưa tham gia lớp học nào. Vào "Tất cả các lớp" để đăng ký.'}
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="Không tìm thấy lớp học"
            message="Thử thay đổi bộ lọc để xem thêm lớp học."
          />
        )
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên lớp</th><th>Môn học</th><th>Giáo viên</th><th>Khối</th><th>Năm học</th><th>Học sinh</th>
                <th>{mode === 'mine' ? 'Meet' : 'Đăng ký'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(classroom => (
                <tr key={classroom.id}>
                  <td><strong>{classroom.name}</strong></td>
                  <td>{classroom.subjectName}</td>
                  <td>{classroom.teacherName}</td>
                  <td>Khối {classroom.gradeLevel}</td>
                  <td>{classroom.schoolYear}</td>
                  <td style={{ fontWeight: 600, color: 'var(--purple)' }}>{classroom.studentCount || 0}</td>
                  <td>
                    {mode === 'mine' ? (
                      classroom.meetUrl
                        ? <a href={classroom.meetUrl} target="_blank" rel="noopener noreferrer" className={styles.btnMeet}>🎥 Tham gia</a>
                        : <span className={styles.cellMuted}>—</span>
                    ) : myClassrooms.some(m => m.id === classroom.id) ? (
                      <span style={{
                        display: 'inline-block', padding: '0.35rem 0.75rem',
                        background: 'var(--green-bg)', color: 'var(--green-dark)',
                        border: '1.5px solid var(--green)', borderRadius: 8,
                        fontSize: '0.78rem', fontWeight: 700,
                      }}>✅ Đã đăng ký</span>
                    ) : (
                      <button
                        className={styles.btnCreate}
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
                        onClick={() => { setEnrollTarget(classroom); setEnrollPassword('') }}
                      >
                        ➕ Đăng ký
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {enrollTarget && (
        <div className={styles.modalOverlay} onClick={() => setEnrollTarget(null)}>
          <div className={styles.modal} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Đăng ký lớp học</h2>
              <button className={styles.btnClose} onClick={() => setEnrollTarget(null)}>✕</button>
            </div>
            <form onSubmit={handleEnroll} className={styles.form}>
              <div style={{ paddingBottom: '0.75rem', borderBottom: '2px solid var(--gray-light)', marginBottom: '0.5rem' }}>
                <p style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '1rem', marginBottom: '0.35rem' }}>
                  {enrollTarget.name}
                </p>
                <p style={{ color: 'var(--gray)', fontSize: '0.88rem' }}>
                  {enrollTarget.subjectName} · Khối {enrollTarget.gradeLevel} · GV: {enrollTarget.teacherName}
                </p>
              </div>
              <div className={styles.formGroup}>
                <label>Mật khẩu lớp học *</label>
                <input
                  type="password"
                  value={enrollPassword}
                  onChange={e => setEnrollPassword(e.target.value)}
                  placeholder="Nhập mật khẩu được giáo viên cung cấp"
                  autoFocus
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setEnrollTarget(null)}>Hủy</button>
                <button type="submit" className={styles.btnSubmit} disabled={enrollLoading}>
                  {enrollLoading ? 'Đang đăng ký...' : 'Xác nhận đăng ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mode === 'mine' && (
        <p
          style={{ marginTop: 20, fontSize: '0.82rem', color: 'var(--gray)', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate('/customer/classrooms')}
        >
          → Xem tất cả các lớp để đăng ký thêm
        </p>
      )}
    </>
  )
}

export default CustomerClassroomsTab
