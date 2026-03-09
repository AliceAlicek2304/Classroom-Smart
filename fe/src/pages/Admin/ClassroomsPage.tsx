import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import StudentsModal from '../../components/StudentsModal'
import { TableSkeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../hooks/useConfirm'
import classroomAPI, { type Classroom, type ClassroomRequest } from '../../services/classroomService'
import subjectAPI, { type Subject, type ApiResponse as SubjectApiResponse } from '../../services/subjectService'
import accountAPI, { type Teacher } from '../../services/accountService'
import styles from './Admin.module.css'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/Pagination'

const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const toast = useToast()
  const { confirm, confirmDialog } = useConfirm()

  const currentYear = new Date().getFullYear()
  const [formData, setFormData] = useState<ClassroomRequest & { teacherId?: number }>({
    name: '',
    gradeLevel: '6',
    schoolYear: `${currentYear}-${currentYear + 1}`,
    description: '',
    subjectId: 0,
    password: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [classroomsRes, subjectsRes, teachersRes] = await Promise.all([
        classroomAPI.getAll(),
        subjectAPI.getActive() as Promise<SubjectApiResponse<Subject[]>>,
        accountAPI.getTeachers()
      ])
      setClassrooms(classroomsRes.data.data || [])
      setSubjects(subjectsRes.data || [])
      setTeachers(teachersRes.data.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) { fetchData(); return }
    try {
      setLoading(true)
      const response = await classroomAPI.search(searchKeyword)
      setClassrooms(response.data.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tìm kiếm')
    } finally {
      setLoading(false)
    }
  }


  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom)
    setFormData({
      name: classroom.name,
      gradeLevel: classroom.gradeLevel,
      schoolYear: classroom.schoolYear,
      description: classroom.description,
      subjectId: classroom.subjectId,
      password: '' // Keep empty unless changing
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.subjectId) {
      toast.error('Vui lòng điền đầy đủ thông tin!')
      return
    }
    try {
      const payload: ClassroomRequest = {
        name: formData.name,
        gradeLevel: formData.gradeLevel,
        schoolYear: formData.schoolYear,
        description: formData.description,
        subjectId: formData.subjectId,
        password: formData.password
      }
      if (!editingClassroom) return
      await classroomAPI.update(editingClassroom.id, payload)
      toast.success('Cập nhật lớp học thành công!')
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!')
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Xóa lớp học',
      message: 'Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      variant: 'danger'
    })
    if (!confirmed) return
    try {
      await classroomAPI.delete(id)
      toast.success('Xóa lớp học thành công!')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa lớp học')
    }
  }

  const filteredClassrooms = classrooms.filter(c =>
    c.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    c.subjectName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    c.teacherName?.toLowerCase().includes(searchKeyword.toLowerCase())
  )
  const { paged, page, totalPages, total, pageSize, setPage } = usePagination(filteredClassrooms)

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Classrooms Management</h1>
            <p className={styles.subtitle}>Quản lý tất cả các lớp học trong hệ thống</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <div className={`${styles.statDot} ${styles.purple}`}></div>
              <span className={styles.statLabel}>Lớp học:</span>
              <span className={styles.statValue}>{classrooms.length}</span>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statDot} ${styles.green}`}></div>
              <span className={styles.statLabel}>Active:</span>
              <span className={styles.statValue}>{classrooms.filter(c => c.isActive).length}</span>
            </div>
          </div>
          {/* Admin doesn't create classrooms, only moderates */}
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên lớp, môn học, giáo viên..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>🔍 Tìm kiếm</button>
        </div>

        {loading ? (
          <TableSkeleton cols={9} />
        ) : filteredClassrooms.length === 0 ? (
          <EmptyState
            icon="🏫"
            title="Chưa có lớp học nào"
            message="Dữ liệu lớp học sẽ được hiển thị khi giáo viên tạo lớp."
          />
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên lớp</th>
                  <th>Môn học</th>
                  <th>Giáo viên</th>
                  <th>Khối</th>
                  <th>Năm học</th>
                  <th>Học sinh</th>
                  <th>Meet</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((classroom) => (
                  <tr key={classroom.id}>
                    <td><strong>{classroom.name}</strong></td>
                    <td>{classroom.subjectName}</td>
                    <td>{classroom.teacherName}</td>
                    <td>Lớp {classroom.gradeLevel}</td>
                    <td>{classroom.schoolYear}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#667eea' }}>
                        {classroom.studentCount || 0}
                      </span>
                    </td>
                    <td>
                      {classroom.meetUrl ? (
                        <a href={classroom.meetUrl} target="_blank" rel="noopener noreferrer" className={styles.btnMeet}>
                          🎥 Meet
                        </a>
                      ) : <span className={styles.cellMuted}>—</span>}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${classroom.isActive ? styles.active : styles.inactive}`}>
                        {classroom.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.btnView}
                          onClick={() => { setSelectedClassroom(classroom); setShowStudentsModal(true) }}
                          title="Quản lý học sinh"
                        >
                          👥
                        </button>
                        <button className={styles.btnEdit} onClick={() => handleEdit(classroom)}>✏️ Sửa</button>
                        <button className={styles.btnDelete} onClick={() => handleDelete(classroom.id)}>🗑️ Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />

        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingClassroom ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}</h2>
                <button className={styles.btnClose} onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tên lớp học *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Toán 6A"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Môn học *</label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: parseInt(e.target.value) })}
                      required
                    >
                      <option value={0}>-- Chọn môn học --</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Giáo viên phụ trách</label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: parseInt(e.target.value) })}
                    >
                      <option value={0}>-- Chọn giáo viên --</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.fullName} ({t.username})</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Khối *</label>
                    <select
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    >
                      {['6', '7', '8', '9'].map((g) => (
                        <option key={g} value={g}>Lớp {g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Năm học *</label>
                    <input
                      type="text"
                      value={formData.schoolYear}
                      onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                      placeholder="VD: 2025-2026"
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả về lớp học..."
                    rows={3}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mật khẩu tham gia lớp</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nhập mật khẩu mới nếu muốn thay đổi"
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className={styles.btnSubmit}>Cập nhật</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showStudentsModal && selectedClassroom && (
          <StudentsModal
            classroomId={selectedClassroom.id}
            classroomName={selectedClassroom.name}
            onClose={() => setShowStudentsModal(false)}
            onUpdate={fetchData}
          />
        )}
        {confirmDialog}
      </div>
    </AdminLayout>
  )
}

export default ClassroomsPage
