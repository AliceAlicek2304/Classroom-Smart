import { useState, useEffect } from 'react'
import TeacherLayout from '../../components/TeacherLayout/TeacherLayout'
import { TableSkeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import classroomAPI, { type Classroom, type ClassroomRequest } from '../../services/classroomService'
import subjectAPI, { type Subject, type ApiResponse as SubjectApiResponse } from '../../services/subjectService'
import StudentsModal from '../../components/StudentsModal'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../hooks/useConfirm'
import styles from '../Admin/Admin.module.css'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/Pagination'

const TeacherClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')
  const [filterSchoolYear, setFilterSchoolYear] = useState('')
  const toast = useToast()
  const { confirm, confirmDialog } = useConfirm()

  const currentYear = new Date().getFullYear()
  const [formData, setFormData] = useState<ClassroomRequest>({
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
      const classroomsRes = await classroomAPI.getMyClassrooms()
      const subjectsRes: SubjectApiResponse<Subject[]> = await subjectAPI.getActive()
      setClassrooms(classroomsRes.data.data || [])
      setSubjects(subjectsRes.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchData()
      return
    }
    try {
      setLoading(true)
      const response = await classroomAPI.search(searchTerm)
      // Filter to show only teacher's classrooms
      const myClassrooms = response.data.data || []
      setClassrooms(myClassrooms)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tìm kiếm')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingClassroom(null)
    setFormData({
      name: '',
      gradeLevel: '6',
      schoolYear: `${currentYear}-${currentYear + 1}`,
      description: '',
      subjectId: subjects[0]?.id || 0,
      password: ''
    })
    setShowModal(true)
  }

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom)
    setFormData({
      name: classroom.name,
      gradeLevel: classroom.gradeLevel,
      schoolYear: classroom.schoolYear,
      description: classroom.description,
      subjectId: classroom.subjectId,
      password: ''
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
      if (editingClassroom) {
        await classroomAPI.update(editingClassroom.id, formData)
        toast.success('Cập nhật lớp học thành công!')
      } else {
        await classroomAPI.create(formData)
        toast.success('Tạo lớp học thành công!')
      }
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!')
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Xóa lớp học',
      message: 'Bạn có chắc chắn muốn xóa lớp học này?',
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

  const handleManageStudents = (classroom: Classroom) => {
    setSelectedClassroom(classroom)
    setShowStudentsModal(true)
  }

  const filteredClassrooms = classrooms.filter(classroom => {
    const matchSearch = !searchTerm.trim() ||
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchSubject = !filterSubject || classroom.subjectName === filterSubject
    const matchGrade = !filterGrade || String(classroom.gradeLevel) === filterGrade
    const matchStatus = filterStatus === '' ||
      (filterStatus === 'active' && classroom.isActive) ||
      (filterStatus === 'inactive' && !classroom.isActive)
    const matchYear = !filterSchoolYear || classroom.schoolYear === filterSchoolYear
    return matchSearch && matchSubject && matchGrade && matchStatus && matchYear
  })

  const uniqueSchoolYears = [...new Set(classrooms.map(c => c.schoolYear))].filter(Boolean).sort()
  const { paged, page, totalPages, total, pageSize, setPage } = usePagination(filteredClassrooms)

  return (
    <TeacherLayout>
      <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý lớp học</h1>
          <p className={styles.subtitle}>Quản lý các lớp học của bạn</p>
        </div>
        <button className={styles.btnCreate} onClick={handleCreate}>
          <span>➕</span> Tạo lớp học mới
        </button>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>🔍 Tìm kiếm</button>
      </div>

      <div className={styles.filterBar}>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Tất cả môn</option>
          {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>

        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Tất cả khối</option>
          {['6','7','8','9'].map(g => <option key={g} value={g}>Khối {g}</option>)}
        </select>

        <select
          value={filterSchoolYear}
          onChange={(e) => setFilterSchoolYear(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Tất cả năm</option>
          {uniqueSchoolYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
          <option value="">Tất cả trạng thái</option>
        </select>

        {(filterSubject || filterGrade || filterSchoolYear || filterStatus !== 'active') && (
          <button
            onClick={() => { setFilterSubject(''); setFilterGrade(''); setFilterSchoolYear(''); setFilterStatus('active'); setSearchTerm('') }}
            className={styles.btnReset}
          >
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton cols={8} />
      ) : filteredClassrooms.length === 0 ? (
        <EmptyState
          icon="🏫"
          title="Không tìm thấy lớp học nào"
          message='Thử thay đổi bộ lọc hoặc nhấn "ạo lớp học" để thêm mới.'
          action={{ label: '+ Tạo lớp học', onClick: handleCreate }}
        />
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên lớp</th>
                <th>Môn học</th>
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
                    <td className={styles.cellBold}>{classroom.name}</td>
                    <td>{classroom.subjectName}</td>
                    <td>{classroom.gradeLevel}</td>
                    <td>{classroom.schoolYear}</td>
                    <td>{classroom.studentCount || 0}</td>
                    <td>
                      {classroom.meetUrl ? (
                        <a href={classroom.meetUrl} target="_blank" rel="noopener noreferrer" className={styles.btnMeet}>
                          🎥 Tham gia
                        </a>
                      ) : <span className={styles.cellMuted}>—</span>}
                    </td>
                    <td>
                      <span className={classroom.isActive ? styles.badgeActive : styles.badgeInactive}>
                        {classroom.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.btnView} 
                          onClick={() => handleManageStudents(classroom)}
                          title="Quản lý học sinh"
                        >
                          👥
                        </button>
                        <button className={styles.btnEdit} onClick={() => handleEdit(classroom)}>
                          ✏️
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDelete(classroom.id)}>
                          🗑️
                        </button>
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
              <h2>{editingClassroom ? 'Sửa lớp học' : 'Tạo lớp học mới'}</h2>
              <button className={styles.btnClose} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Tên lớp học *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Lớp Toán 6A"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Môn học *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: parseInt(e.target.value) })}
                    required
                  >
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Khối (THCS) *</label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  >
                    {['6', '7', '8', '9'].map((grade) => (
                      <option key={grade} value={grade}>Lớp {grade}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Năm học *</label>
                  <input
                    type="text"
                    value={formData.schoolYear}
                    onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                    placeholder="VD: 2024-2025"
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
                <label>Mật khẩu lớp {!editingClassroom && '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingClassroom ? 'Nhập mật khẩu mới nếu muốn thay đổi' : 'Học sinh dùng mật khẩu này để tham gia'}
                  required={!editingClassroom}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  {editingClassroom ? 'Cập nhật' : 'Tạo mới'}
                </button>
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
    </TeacherLayout>
  )
}

export default TeacherClassroomsPage
