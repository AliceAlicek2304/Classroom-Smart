import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../hooks/useConfirm'
import subjectAPI, { type Subject, type SubjectRequest } from '../../services/subjectService'
import styles from './Admin.module.css'

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  const [formData, setFormData] = useState<SubjectRequest>({
    name: '',
    description: '',
    grade: 6,
    isActive: true
  })

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const response = await subjectAPI.getAll()
      if (response.success) {
        setSubjects(response.data)
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách môn học')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchSubjects()
      return
    }
    try {
      const response = await subjectAPI.search(searchKeyword)
      if (response.success) {
        setSubjects(response.data)
      }
    } catch (error) {
      toast.error('Tìm kiếm thất bại')
    }
  }

  const handleCreate = () => {
    setEditingSubject(null)
    setFormData({
      name: '',
      description: '',
      grade: 6,
      isActive: true
    })
    setShowModal(true)
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      description: subject.description,
      grade: subject.grade || 6,
      isActive: subject.isActive
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSubject) {
        const response = await subjectAPI.update(editingSubject.id, formData)
        if (response.success) {
          toast.success('Cập nhật môn học thành công!')
          fetchSubjects()
          setShowModal(false)
        }
      } else {
        const response = await subjectAPI.create(formData)
        if (response.success) {
          toast.success('Tạo môn học thành công!')
          fetchSubjects()
          setShowModal(false)
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Xóa môn học',
      message: 'Bạn có chắc muốn xóa môn học này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      variant: 'danger'
    })
    
    if (!confirmed) return
    
    try {
      const response = await subjectAPI.delete(id)
      if (response.success) {
        toast.success('Xóa môn học thành công!')
        fetchSubjects()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa môn học')
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Subjects Management</h1>
            <p className={styles.subtitle}>Quản lý các môn học trong hệ thống</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            <span>➕</span> Thêm môn học
          </button>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            🔍 Tìm kiếm
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : subjects.length === 0 ? (
          <div className={styles.empty}>
            <h3>Chưa có môn học nào</h3>
            <p>Nhấn "Thêm môn học" để tạo môn học mới</p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên môn học</th>
                  <th>Mô tả</th>
                  <th>Khối</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.id}</td>
                    <td><strong>{subject.name}</strong></td>
                    <td>{subject.description}</td>
                    <td>Lớp {subject.grade}</td>
                    <td>
                      <span className={`${styles.badge} ${subject.isActive ? styles.active : styles.inactive}`}>
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnEdit} onClick={() => handleEdit(subject)}>
                          ✏️ Sửa
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDelete(subject.id)}>
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}</h2>
                <button className={styles.btnClose} onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className={styles.form}>
                    <div className={styles.formGroup}>
                      <label>Tên môn học *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="VD: Toán học"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Mô tả</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả về môn học"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Khối (THCS) *</label>
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                      >
                        {[6, 7, 8, 9].map((grade) => (
                          <option key={grade} value={grade}>Lớp {grade}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <span>Active (Kích hoạt môn học)</span>
                      </label>
                    </div>
                  </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className={styles.btnSubmit}>
                    {editingSubject ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ConfirmDialog />
      </div>
    </AdminLayout>
  )
}

export default SubjectsPage
