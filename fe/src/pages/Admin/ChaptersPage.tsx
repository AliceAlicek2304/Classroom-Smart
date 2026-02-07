import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import { useToast } from '../../components/Toast'
import chapterAPI, { type Chapter, type ChapterRequest } from '../../services/chapterService'
import textbookAPI, { type Textbook } from '../../services/textbookService'
import styles from './Admin.module.css'

const ChaptersPage = () => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [textbooks, setTextbooks] = useState<Textbook[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const toast = useToast()

  const [formData, setFormData] = useState<ChapterRequest>({
    title: '',
    chapterNumber: 1,
    description: '',
    pageStart: 1,
    pageEnd: 1,
    isActive: true,
    textbookId: 0
  })

  useEffect(() => {
    fetchChapters()
    fetchTextbooks()
  }, [])

  const fetchChapters = async () => {
    try {
      setLoading(true)
      const response = await chapterAPI.getAll()
      if (response.success) {
        setChapters(response.data)
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách chương')
    } finally {
      setLoading(false)
    }
  }

  const fetchTextbooks = async () => {
    try {
      const response = await textbookAPI.getAll()
      if (response.success) {
        setTextbooks(response.data)
      }
    } catch (error) {
      console.error('Failed to load textbooks')
    }
  }

  const handleCreate = () => {
    setEditingChapter(null)
    setFormData({
      title: '',
      chapterNumber: 1,
      description: '',
      pageStart: 1,
      pageEnd: 1,
      isActive: true,
      textbookId: textbooks[0]?.id || 0
    })
    setShowModal(true)
  }

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter)
    setFormData({
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      description: chapter.description,
      pageStart: chapter.pageStart,
      pageEnd: chapter.pageEnd,
      isActive: chapter.isActive,
      textbookId: chapter.textbookId
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingChapter) {
        const response = await chapterAPI.update(editingChapter.id, formData)
        if (response.success) {
          toast.success('Cập nhật chương thành công!')
          fetchChapters()
          setShowModal(false)
        }
      } else {
        const response = await chapterAPI.create(formData)
        if (response.success) {
          toast.success('Tạo chương thành công!')
          fetchChapters()
          setShowModal(false)
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa chương này?')) return
    
    try {
      const response = await chapterAPI.delete(id)
      if (response.success) {
        toast.success('Xóa chương thành công!')
        fetchChapters()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa chương')
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>📝 Chapters Management</h1>
            <p>Quản lý các chương sách trong hệ thống</p>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.btnPrimary} onClick={handleCreate}>
              <span>➕</span>
              Thêm chương
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : chapters.length === 0 ? (
          <div className={styles.empty}>
            <h3>Chưa có chương nào</h3>
            <p>Nhấn "Thêm chương" để tạo chương mới</p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Số chương</th>
                  <th>Tên chương</th>
                  <th>Sách giáo khoa</th>
                  <th>Trang</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter) => (
                  <tr key={chapter.id}>
                    <td>{chapter.id}</td>
                    <td><strong>Chương {chapter.chapterNumber}</strong></td>
                    <td>{chapter.title}</td>
                    <td>{chapter.textbookTitle}</td>
                    <td>{chapter.pageStart} - {chapter.pageEnd}</td>
                    <td>
                      <span className={`${styles.badge} ${chapter.isActive ? styles.active : styles.inactive}`}>
                        {chapter.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnEdit} onClick={() => handleEdit(chapter)}>
                          ✏️ Sửa
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDelete(chapter.id)}>
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
                <h2>{editingChapter ? 'Chỉnh sửa chương' : 'Thêm chương mới'}</h2>
                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.form}>
                    <div className={styles.formGroup}>
                      <label>Sách giáo khoa *</label>
                      <select
                        value={formData.textbookId}
                        onChange={(e) => setFormData({ ...formData, textbookId: parseInt(e.target.value) })}
                        required
                      >
                        <option value="">Chọn sách giáo khoa</option>
                        {textbooks.map((textbook) => (
                          <option key={textbook.id} value={textbook.id}>
                            {textbook.title} - {textbook.subjectName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Số chương *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.chapterNumber}
                        onChange={(e) => setFormData({ ...formData, chapterNumber: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tên chương *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="VD: Hàm số bậc nhất"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Trang bắt đầu *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.pageStart}
                        onChange={(e) => setFormData({ ...formData, pageStart: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Trang kết thúc *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.pageEnd}
                        onChange={(e) => setFormData({ ...formData, pageEnd: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Mô tả</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả về chương"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <span>Active (Kích hoạt chương)</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editingChapter ? 'Cập nhật' : 'Tạo mới'}
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

export default ChaptersPage
