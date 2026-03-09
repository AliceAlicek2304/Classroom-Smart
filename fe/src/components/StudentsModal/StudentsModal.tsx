import { useState, useEffect } from 'react'
import studentAPI, { type StudentInClass, type Student } from '../../services/studentService'
import { useToast } from '../Toast'
import { useConfirm } from '../../hooks/useConfirm'
import styles from './StudentsModal.module.css'

interface StudentsModalProps {
  classroomId: number
  classroomName: string
  onClose: () => void
  onUpdate: () => void
}

const StudentsModal = ({ classroomId, classroomName, onClose, onUpdate }: StudentsModalProps) => {
  const [students, setStudents] = useState<StudentInClass[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const toast = useToast()
  const { confirm, confirmDialog } = useConfirm()

  useEffect(() => {
    fetchData()
  }, [classroomId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [studentsRes, allStudentsRes] = await Promise.all([
        studentAPI.getStudentsInClassroom(classroomId),
        studentAPI.getAllStudents()
      ])
      setStudents(studentsRes.data.data || [])
      setAllStudents(allStudentsRes.data.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getStudentsInClassroom(classroomId)
      setStudents(response.data.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách học sinh')
    }
  }

  // Filter students: remove those already in classroom and match search term
  const availableStudents = allStudents.filter(student => {
    const isInClassroom = students.some(s => s.studentId === student.id)
    if (isInClassroom) return false
    
    if (!searchTerm.trim()) return false
    
    const search = searchTerm.toLowerCase()
    return (
      student.fullName.toLowerCase().includes(search) ||
      student.username.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search)
    )
  })

  const handleAddStudent = async () => {
    if (!selectedStudent) {
      toast.error('Vui lòng chọn học sinh')
      return
    }

    try {
      await studentAPI.addStudent(classroomId, selectedStudent.id)
      toast.success('Thêm học sinh thành công!')
      setSearchTerm('')
      setSelectedStudent(null)
      setShowAddForm(false)
      fetchStudents()
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm học sinh')
    }
  }

  const handleRemoveStudent = async (studentId: number) => {
    const confirmed = await confirm({
      title: 'Xóa học sinh',
      message: 'Bạn có chắc chắn muốn xóa học sinh này khỏi lớp?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      variant: 'danger'
    })
    
    if (!confirmed) return

    try {
      await studentAPI.removeStudent(classroomId, studentId)
      toast.success('Đã xóa học sinh khỏi lớp!')
      await fetchStudents()
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa học sinh')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>Quản lý học sinh</h2>
            <p className={styles.classroomName}>{classroomName}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.toolbar}>
            <div className={styles.count}>
              Tổng số: <strong>{students.length}</strong> học sinh
            </div>
            <button 
              className={styles.addBtn} 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '✕ Đóng' : '➕ Thêm học sinh'}
            </button>
          </div>

          {showAddForm && (
            <div className={styles.addForm}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSelectedStudent(null)
                  }}
                  placeholder="Tìm kiếm học sinh theo tên, username, email..."
                  autoFocus
                />
                {searchTerm && availableStudents.length > 0 && (
                  <div className={styles.searchResults}>
                    {availableStudents.slice(0, 10).map((student) => (
                      <div 
                        key={student.id} 
                        className={`${styles.resultItem} ${selectedStudent?.id === student.id ? styles.selected : ''}`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className={styles.resultAvatar}>
                          {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className={styles.resultInfo}>
                          <div className={styles.resultName}>{student.fullName}</div>
                          <div className={styles.resultMeta}>
                            👤 {student.username} • ✉️ {student.email}
                          </div>
                        </div>
                        {selectedStudent?.id === student.id && (
                          <span className={styles.checkmark}>✓</span>
                        )}
                      </div>
                    ))}
                    {availableStudents.length > 10 && (
                      <div className={styles.moreResults}>
                        Có thêm {availableStudents.length - 10} kết quả khác...
                      </div>
                    )}
                  </div>
                )}
                {searchTerm && availableStudents.length === 0 && (
                  <div className={styles.noResults}>
                    Không tìm thấy học sinh nào phù hợp
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={handleAddStudent}
                disabled={!selectedStudent}
                className={styles.addSubmitBtn}
              >
                Thêm
              </button>
            </div>
          )}

          {loading ? (
            <div className={styles.loading}>Đang tải...</div>
          ) : students.length === 0 ? (
            <div className={styles.empty}>
              <p>Chưa có học sinh nào trong lớp</p>
              <button className={styles.emptyAddBtn} onClick={() => setShowAddForm(true)}>
                Thêm học sinh đầu tiên
              </button>
            </div>
          ) : (
            <div className={styles.studentList}>
              {students.map((student) => (
                <div key={student.id} className={styles.studentCard}>
                  <div className={styles.studentAvatar}>
                    {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className={styles.studentInfo}>
                    <div className={styles.studentName}>{student.fullName}</div>
                    <div className={styles.studentDetails}>
                      <span>👤 {student.username}</span>
                      <span>✉️ {student.email}</span>
                    </div>
                    <div className={styles.studentMeta}>
                      Tham gia: {formatDate(student.enrolledAt)}
                    </div>
                  </div>
                  <button 
                    className={styles.removeBtn}
                    onClick={() => handleRemoveStudent(student.studentId)}
                    title="Xóa khỏi lớp"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {confirmDialog}
    </div>
  )
}

export default StudentsModal
