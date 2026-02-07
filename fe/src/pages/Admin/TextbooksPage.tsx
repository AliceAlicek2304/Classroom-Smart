import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import { useToast } from '../../components/Toast'
import textbookAPI, { type Textbook, type TextbookRequest } from '../../services/textbookService'
import subjectAPI, { type Subject } from '../../services/subjectService'
import styles from './Admin.module.css'

const TextbooksPage = () => {
  const [textbooks, setTextbooks] = useState<Textbook[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTextbook, setEditingTextbook] = useState<Textbook | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const toast = useToast()

  const [formData, setFormData] = useState<TextbookRequest>({
    title: '',
    description: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    grade: 6,
    isActive: true,
    subjectId: 0
  })

  useEffect(() => {
    fetchTextbooks()
    fetchSubjects()
  }, [])

  const fetchTextbooks = async () => {
    try {
      setLoading(true)
      const response = await textbookAPI.getAll()
      if (response.success) {
        setTextbooks(response.data)
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách sách giáo khoa')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll()
      if (response.success) {
        setSubjects(response.data)
      }
    } catch (error) {
      console.error('Failed to load subjects')
    }
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchTextbooks()
      return
    }
    try {
      const response = await textbookAPI.search(searchKeyword)
      if (response.success) {
        setTextbooks(response.data)
      }
    } catch (error) {
      toast.error('Tìm kiếm thất bại')
    }
  }

  const handleCreate = () => {
    setEditingTextbook(null)
    setFormData({
      title: '',
      description: '',
      publisher: '',
      publicationYear: new Date().getFullYear(),
      grade: 6,
      isActive: true,
      subjectId: subjects[0]?.id || 0
    })
    setShowModal(true)
  }

  const handleEdit = (textbook: Textbook) => {
    setEditingTextbook(textbook)
    setFormData({
      title: textbook.title,
      description: textbook.description,
      publisher: textbook.publisher,
      publicationYear: textbook.publicationYear,
      grade: textbook.grade,
      isActive: textbook.isActive,
      subjectId: textbook.subjectId
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTextbook) {
        const response = await textbookAPI.update(editingTextbook.id, formData)
        if (response.success) {
          toast.success('Cập nhật sách giáo khoa thành công!')
          fetchTextbooks()
          setShowModal(false)
        }
      } else {
        const response = await textbookAPI.create(formData)
        if (response.success) {
          toast.success('Tạo sách giáo khoa thành công!')
          fetchTextbooks()
          setShowModal(false)
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa sách giáo khoa này?')) return
    
    try {
      const response = await textbookAPI.delete(id)
      if (response.success) {
        toast.success('Xóa sách giáo khoa thành công!')
        fetchTextbooks()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa sách giáo khoa')
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>📖 Textbooks Management</h1>
            <p>Quản lý sách giáo khoa trong hệ thống</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                🔍
              </button>
            </div>
            <button className={styles.btnPrimary} onClick={handleCreate}>
              <span>➕</span>
              Thêm sách
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : textbooks.length === 0 ? (
          <div className={styles.empty}>
            <h3>Chưa có sách giáo khoa nào</h3>
            <p>Nhấn "Thêm sách" để tạo sách giáo khoa mới</p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên sách</th>
                  <th>Môn học</th>
                  <th>Nhà xuất bản</th>
                  <th>Năm</th>
                  <th>Khối</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {textbooks.map((textbook) => (
                  <tr key={textbook.id}>
                    <td>{textbook.id}</td>
                    <td><strong>{textbook.title}</strong></td>
                    <td>{textbook.subjectName}</td>
                    <td>{textbook.publisher}</td>
                    <td>{textbook.publicationYear}</td>
                    <td>Lớp {textbook.grade}</td>
                    <td>
                      <span className={`${styles.badge} ${textbook.isActive ? styles.active : styles.inactive}`}>
                        {textbook.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnEdit} onClick={() => handleEdit(textbook)}>
                          ✏️ Sửa
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDelete(textbook.id)}>
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
          <div className={styles.modal} onClick={() => setShowModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingTextbook ? 'Chỉnh sửa sách giáo khoa' : 'Thêm sách giáo khoa mới'}</h2>
                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.form}>
                    <div className={styles.formGroup}>
                      <label>Tên sách *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="VD: Toán học 10"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Môn học *</label>
                      <select
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: parseInt(e.target.value) })}
                        required
                      >
                        <option value="">Chọn môn học</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} - Lớp {subject.grade}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Nhà xuất bản *</label>
                      <input
                        type="text"
                        required
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        placeholder="VD: Nhà xuất bản Giáo dục"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Năm xuất bản *</label>
                      <input
                        type="number"
                        required
                        min="2000"
                        max="2100"
                        value={formData.publicationYear}
                        onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) })}
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
                      <label>Mô tả</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả về sách giáo khoa"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <span>Active (Kích hoạt sách)</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editingTextbook ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default TextbooksPage
