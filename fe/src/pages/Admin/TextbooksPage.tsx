import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../hooks/useConfirm'
import textbookAPI, { type Textbook, type TextbookRequest } from '../../services/textbookService'
import chapterAPI, { type Chapter, type ChapterRequest } from '../../services/chapterService'
import { SERVER_URL } from '../../services/api'
import subjectAPI, { type Subject } from '../../services/subjectService'
import styles from './Admin.module.css'
import tbStyles from './TextbooksPage.module.css'

const TextbooksPage = () => {
  const [textbooks, setTextbooks] = useState<Textbook[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showTextbookModal, setShowTextbookModal] = useState(false)
  const [editingTextbook, setEditingTextbook] = useState<Textbook | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  // Expand/collapse chapters per textbook
  const [expandedTextbookId, setExpandedTextbookId] = useState<number | null>(null)
  const [chaptersByTextbook, setChaptersByTextbook] = useState<Record<number, Chapter[]>>({})
  const [loadingChapters, setLoadingChapters] = useState<Record<number, boolean>>({})

  // Chapter modal
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [chapterModalTextbookId, setChapterModalTextbookId] = useState<number>(0)

  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  const [formData, setFormData] = useState<TextbookRequest>({
    title: '', description: '', publisher: '',
    publicationYear: new Date().getFullYear(),
    grade: 6, isActive: true, subjectId: 0
  })

  const [chapterFormData, setChapterFormData] = useState<ChapterRequest>({
    title: '', chapterNumber: 1, description: '',
    isActive: true, textbookId: 0, pdfFile: undefined
  })

  useEffect(() => {
    fetchTextbooks()
    fetchSubjects()
  }, [])

  const fetchTextbooks = async () => {
    try {
      setLoading(true)
      const response = await textbookAPI.getAll()
      if (response.success) setTextbooks(response.data)
    } catch {
      toast.error('Không thể tải danh sách sách giáo khoa')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll()
      if (response.success) setSubjects(response.data)
    } catch {
      console.error('Failed to load subjects')
    }
  }

  const fetchChapters = useCallback(async (textbookId: number) => {
    setLoadingChapters(prev => ({ ...prev, [textbookId]: true }))
    try {
      const response = await chapterAPI.getByTextbook(textbookId)
      if (response.success) {
        setChaptersByTextbook(prev => ({ ...prev, [textbookId]: response.data }))
      }
    } catch {
      toast.error('Không thể tải chương')
    } finally {
      setLoadingChapters(prev => ({ ...prev, [textbookId]: false }))
    }
  }, [toast])

  const toggleChapters = (textbookId: number) => {
    if (expandedTextbookId === textbookId) {
      setExpandedTextbookId(null)
    } else {
      setExpandedTextbookId(textbookId)
      if (!chaptersByTextbook[textbookId]) {
        fetchChapters(textbookId)
      }
    }
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) { fetchTextbooks(); return }
    try {
      const response = await textbookAPI.search(searchKeyword)
      if (response.success) setTextbooks(response.data)
    } catch {
      toast.error('Tìm kiếm thất bại')
    }
  }

  // ===== Textbook CRUD =====
  const handleCreateTextbook = () => {
    setEditingTextbook(null)
    setFormData({
      title: '', description: '', publisher: '',
      publicationYear: new Date().getFullYear(),
      grade: 6, isActive: true,
      subjectId: subjects[0]?.id || 0
    })
    setShowTextbookModal(true)
  }

  const handleEditTextbook = (textbook: Textbook) => {
    setEditingTextbook(textbook)
    setFormData({
      title: textbook.title, description: textbook.description,
      publisher: textbook.publisher, publicationYear: textbook.publicationYear,
      grade: textbook.grade || 6, isActive: textbook.isActive, subjectId: textbook.subjectId
    })
    setShowTextbookModal(true)
  }

  const handleSubmitTextbook = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTextbook) {
        const res = await textbookAPI.update(editingTextbook.id, formData)
        if (res.success) { toast.success('Cập nhật sách thành công!'); fetchTextbooks(); setShowTextbookModal(false) }
      } else {
        const res = await textbookAPI.create(formData)
        if (res.success) { toast.success('Tạo sách thành công!'); fetchTextbooks(); setShowTextbookModal(false) }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleDeleteTextbook = async (id: number) => {
    const confirmed = await confirm({
      title: 'Xóa sách giáo khoa',
      message: 'Bạn có chắc muốn xóa? Các chương thuộc sách này cũng sẽ bị xóa.',
      confirmText: 'Xóa', cancelText: 'Hủy', variant: 'danger'
    })
    if (!confirmed) return
    try {
      const res = await textbookAPI.delete(id)
      if (res.success) {
        toast.success('Xóa sách thành công!')
        setChaptersByTextbook(prev => { const n = { ...prev }; delete n[id]; return n })
        if (expandedTextbookId === id) setExpandedTextbookId(null)
        fetchTextbooks()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa sách')
    }
  }

  // ===== Chapter CRUD =====
  const handleCreateChapter = (textbookId: number) => {
    setEditingChapter(null)
    setChapterModalTextbookId(textbookId)
    const existing = chaptersByTextbook[textbookId] || []
    setChapterFormData({
      title: '', chapterNumber: existing.length + 1, description: '',
      isActive: true, textbookId, pdfFile: undefined
    })
    setShowChapterModal(true)
  }

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter)
    setChapterModalTextbookId(chapter.textbookId)
    setChapterFormData({
      title: chapter.title, chapterNumber: chapter.chapterNumber,
      description: chapter.description, isActive: chapter.isActive, 
      textbookId: chapter.textbookId, pdfFile: undefined
    })
    setShowChapterModal(true)
  }

  const handleSubmitChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingChapter) {
        const res = await chapterAPI.update(editingChapter.id, chapterFormData)
        if (res.success) {
          toast.success('Cập nhật chương thành công!')
          fetchChapters(chapterModalTextbookId)
          setShowChapterModal(false)
        }
      } else {
        const res = await chapterAPI.create(chapterFormData)
        if (res.success) {
          toast.success('Tạo chương thành công!')
          fetchChapters(chapterModalTextbookId)
          setShowChapterModal(false)
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleDeleteChapter = async (chapter: Chapter) => {
    const confirmed = await confirm({
      title: 'Xóa chương', message: `Xóa chương ${chapter.chapterNumber}: "${chapter.title}"?`,
      confirmText: 'Xóa', cancelText: 'Hủy', variant: 'danger'
    })
    if (!confirmed) return
    try {
      const res = await chapterAPI.delete(chapter.id)
      if (res.success) {
        toast.success('Xóa chương thành công!')
        fetchChapters(chapter.textbookId)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa chương')
    }
  }

  const handleDownloadAll = async (textbook: Textbook) => {
    try {
      const blob = await textbookAPI.downloadFull(textbook.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Textbook_${textbook.title.replace(/\s+/g, '_')}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đang bắt đầu tải về trọn bộ chương...');
    } catch (error) {
      toast.error('Không thể tải về. Vui lòng thử lại sau.');
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        {/* ===== Page Header ===== */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Textbooks Management</h1>
            <p className={styles.subtitle}>Quản lý sách giáo khoa và các chương bên trong</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <div className={`${styles.statDot} ${styles.purple}`}></div>
              <span className={styles.statLabel}>Sách:</span>
              <span className={styles.statValue}>{textbooks.length}</span>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statDot} ${styles.green}`}></div>
              <span className={styles.statLabel}>Active:</span>
              <span className={styles.statValue}>{textbooks.filter(t => t.isActive).length}</span>
            </div>
          </div>
          <button className={styles.btnCreate} onClick={handleCreateTextbook}>
            <span>➕</span> Thêm sách
          </button>
        </div>

        {/* ===== Search ===== */}
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>🔍 Tìm kiếm</button>
        </div>

        {/* ===== Textbook List ===== */}
        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : textbooks.length === 0 ? (
          <div className={styles.empty}>
            <h3>Chưa có sách giáo khoa nào</h3>
            <p>Nhấn "Thêm sách" để tạo sách giáo khoa mới</p>
          </div>
        ) : (
          <div className={tbStyles.textbookList}>
            {textbooks.map((textbook) => {
              const isExpanded = expandedTextbookId === textbook.id
              const chapters = chaptersByTextbook[textbook.id] || []
              const loadingCh = loadingChapters[textbook.id]

              return (
                <div key={textbook.id} className={tbStyles.textbookCard}>
                  {/* Textbook row */}
                  <div className={tbStyles.textbookRow}>
                    <button
                      className={tbStyles.expandBtn}
                      onClick={() => toggleChapters(textbook.id)}
                      title={isExpanded ? 'Ẩn chương' : 'Xem chương'}
                    >
                      <span className={`${tbStyles.expandIcon} ${isExpanded ? tbStyles.expanded : ''}`}>▶</span>
                    </button>

                    <div className={tbStyles.textbookInfo}>
                      <div className={tbStyles.textbookMain}>
                        <strong className={tbStyles.textbookTitle}>{textbook.title}</strong>
                        <span className={tbStyles.textbookMeta}>
                          {textbook.subjectName} · Lớp {textbook.grade} · {textbook.publisher} · {textbook.publicationYear}
                        </span>
                      </div>
                    </div>

                    <div className={tbStyles.textbookActions}>
                      <span className={`${styles.badge} ${textbook.isActive ? styles.active : styles.inactive}`}>
                        {textbook.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button className={styles.btnEdit} onClick={() => handleEditTextbook(textbook)}>✏️ Sửa</button>
                      <button className={styles.btnDelete} onClick={() => handleDeleteTextbook(textbook.id)}>🗑️ Xóa</button>
                      <button 
                        className={styles.btnDownload} 
                        onClick={() => handleDownloadAll(textbook)}
                        title="Tải toàn bộ các chương trong sách"
                      >
                        📥 Tải toàn bộ
                      </button>
                    </div>
                  </div>

                  {/* Chapters panel */}
                  {isExpanded && (
                    <div className={tbStyles.chaptersPanel}>
                      <div className={tbStyles.chaptersPanelHeader}>
                        <span className={tbStyles.chapterCount}>
                          📝 {loadingCh ? 'Đang tải...' : `${chapters.length} chương`}
                        </span>
                        <button
                          className={tbStyles.addChapterBtn}
                          onClick={() => handleCreateChapter(textbook.id)}
                        >
                          ➕ Thêm chương
                        </button>
                      </div>

                      {loadingCh ? (
                        <div className={tbStyles.chapterLoading}>Đang tải chương...</div>
                      ) : chapters.length === 0 ? (
                        <div className={tbStyles.chapterEmpty}>
                          <p>Chưa có chương nào. <button className={tbStyles.inlineAddBtn} onClick={() => handleCreateChapter(textbook.id)}>Thêm ngay</button></p>
                        </div>
                      ) : (
                        <div className={tbStyles.chapterTable}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>Chương</th>
                                <th>Tên chương</th>
                                <th>Nội dung</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chapters
                                .sort((a, b) => a.chapterNumber - b.chapterNumber)
                                .map((ch) => (
                                  <tr key={ch.id}>
                                    <td><strong>Ch. {ch.chapterNumber}</strong></td>
                                    <td>{ch.title}</td>
                                    <td>
                                      {ch.pdfUrl ? (
                                        <a href={`${SERVER_URL}${ch.pdfUrl}`} target="_blank" rel="noopener noreferrer" className={styles.linkView}>
                                          📄 Xem chương
                                        </a>
                                      ) : (
                                        <span className={styles.noFile}>Chưa có file</span>
                                      )}
                                    </td>
                                    <td>
                                      <span className={`${styles.badge} ${ch.isActive ? styles.active : styles.inactive}`}>
                                        {ch.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    </td>
                                    <td>
                                      <div className={styles.actions}>
                                        <button className={styles.btnEdit} onClick={() => handleEditChapter(ch)}>✏️ Sửa</button>
                                        <button className={styles.btnDelete} onClick={() => handleDeleteChapter(ch)}>🗑️ Xóa</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ===== Textbook Modal ===== */}
        {showTextbookModal && (
          <div className={styles.modalOverlay} onClick={() => setShowTextbookModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingTextbook ? 'Chỉnh sửa sách giáo khoa' : 'Thêm sách giáo khoa mới'}</h2>
                <button className={styles.btnClose} onClick={() => setShowTextbookModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmitTextbook}>
                <div className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Tên sách *</label>
                    <input type="text" required value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="VD: Toán học 10" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Môn học *</label>
                    <select value={formData.subjectId}
                      onChange={(e) => {
                        const sid = parseInt(e.target.value);
                        const subject = subjects.find(s => s.id === sid);
                        setFormData({ 
                          ...formData, 
                          subjectId: sid,
                          grade: subject ? subject.grade : formData.grade 
                        });
                      }} required>
                      <option value="">Chọn môn học</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} - Lớp {s.grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Nhà xuất bản *</label>
                      <input type="text" required value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        placeholder="VD: NXB Giáo dục" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Năm xuất bản *</label>
                      <input type="number" required min="2000" max="2100"
                        value={formData.publicationYear}
                        onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) })} />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Mô tả</label>
                    <textarea value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Mô tả về sách giáo khoa" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.checkbox}>
                      <input type="checkbox" checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                      <span>Active (Kích hoạt sách)</span>
                    </label>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={() => setShowTextbookModal(false)}>Hủy</button>
                  <button type="submit" className={styles.btnSubmit}>
                    {editingTextbook ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== Chapter Modal ===== */}
        {showChapterModal && (
          <div className={styles.modalOverlay} onClick={() => setShowChapterModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingChapter ? 'Chỉnh sửa chương' : 'Thêm chương mới'}</h2>
                <button className={styles.btnClose} onClick={() => setShowChapterModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmitChapter}>
                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Số chương *</label>
                      <input type="number" required min="1"
                        value={chapterFormData.chapterNumber}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, chapterNumber: parseInt(e.target.value) })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tên chương *</label>
                      <input type="text" required
                        value={chapterFormData.title}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, title: e.target.value })}
                        placeholder="VD: Hàm số bậc nhất" />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nội dung (PDF) *</label>
                    <input type="file" accept=".pdf"
                      onChange={(e) => setChapterFormData({ ...chapterFormData, pdfFile: e.target.files?.[0] })} />
                    {editingChapter?.pdfUrl && !chapterFormData.pdfFile && (
                      <small className={styles.helpText}>Hiện tại: {editingChapter.pdfUrl.split('_').pop()}</small>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mô tả</label>
                    <textarea value={chapterFormData.description}
                      onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                      placeholder="Mô tả nội dung chương" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.checkbox}>
                      <input type="checkbox" checked={chapterFormData.isActive}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, isActive: e.target.checked })} />
                      <span>Active (Kích hoạt chương)</span>
                    </label>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={() => setShowChapterModal(false)}>Hủy</button>
                  <button type="submit" className={styles.btnSubmit}>
                    {editingChapter ? 'Cập nhật' : 'Tạo mới'}
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

export default TextbooksPage
