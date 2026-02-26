import { useState, useEffect } from 'react'
import { TableSkeleton } from '../../../components/Skeleton'
import { EmptyState } from '../../../components/EmptyState'
import textbookAPI, { type Textbook } from '../../../services/textbookService'
import chapterAPI, { type Chapter } from '../../../services/chapterService'
import { useToast } from '../../../components/Toast'
import styles from '../../Admin/Admin.module.css'

const CustomerDocsTab = () => {
  const toast = useToast()

  const [textbooks, setTextbooks] = useState<Textbook[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [filterSubject, setFilterSubject] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterPublisher, setFilterPublisher] = useState('')
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(false)
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchDocs = async () => {
      setDocsLoading(true)
      try {
        const res = await textbookAPI.getActive()
        setTextbooks(res.data || [])
      } catch (error: unknown) {
        const e = error as { response?: { data?: { message?: string } } }
        toast.error(e.response?.data?.message || 'Lỗi khi tải tài liệu')
      } finally {
        setDocsLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const handleViewTextbook = async (tb: Textbook) => {
    setSelectedTextbook(tb)
    setExpandedChapters(new Set())
    setChaptersLoading(true)
    try {
      const res = await chapterAPI.getByTextbook(tb.id)
      const active = ((res.data || []) as Chapter[]).filter(c => c.isActive)
      active.sort((a, b) => a.chapterNumber - b.chapterNumber)
      setChapters(active)
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi tải chương')
    } finally {
      setChaptersLoading(false)
    }
  }

  const toggleChapter = (id: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const uniqueSubjects = [...new Set(textbooks.map(t => t.subjectName))].filter(Boolean).sort() as string[]
  const uniquePublishers = [...new Set(textbooks.map(t => t.publisher))].filter(Boolean).sort()
  const filtered = textbooks.filter(t => {
    if (filterSubject && t.subjectName !== filterSubject) return false
    if (filterGrade && String(t.grade) !== filterGrade) return false
    if (filterPublisher && t.publisher !== filterPublisher) return false
    return true
  })
  const hasFilter = filterSubject || filterGrade || filterPublisher

  const resetFilters = () => {
    setFilterSubject('')
    setFilterGrade('')
    setFilterPublisher('')
  }

  if (selectedTextbook) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button className={styles.btnReset} onClick={() => setSelectedTextbook(null)}>
            ← Quay lại
          </button>
          <div>
            <strong style={{ fontSize: '1.05rem', color: 'var(--dark)' }}>{selectedTextbook.title}</strong>
            <span style={{ color: 'var(--gray)', fontSize: '0.88rem', marginLeft: '0.6rem' }}>
              {selectedTextbook.subjectName} · Khối {selectedTextbook.grade}
            </span>
          </div>
        </div>
        {chaptersLoading ? (
          <TableSkeleton cols={2} rows={4} />
        ) : chapters.length === 0 ? (
          <EmptyState icon="📄" title="Chưa có chương nào" message="Sách này chưa có chương nào được cập nhật." />
        ) : (
          <div className={styles.accordion}>
            {chapters.map(ch => {
              const isOpen = expandedChapters.has(ch.id)
              return (
                <div key={ch.id} className={`${styles.accordionRow} ${isOpen ? styles.accordionOpen : ''}`}>
                  <div className={styles.accordionHeader} onClick={() => toggleChapter(ch.id)}>
                    <div className={styles.accordionToggle}>{isOpen ? '−' : '+'}</div>
                    <span className={styles.accordionTitle}>{ch.chapterNumber}. {ch.title}</span>
                    {ch.pdfUrl && <span className={styles.accordionMeta}>📎 PDF</span>}
                  </div>
                  {isOpen && (
                    <div className={styles.accordionBody}>
                      {ch.pdfUrl ? (
                        <div className={styles.accordionItem}>
                          <span className={styles.accordionItemIcon}>📄</span>
                          <span className={styles.accordionItemTitle}>
                            <a href={`http://localhost:8080${ch.pdfUrl}`} target="_blank" rel="noopener noreferrer">
                              Nội dung chương {ch.chapterNumber}{ch.description ? ` — ${ch.description}` : ''}
                            </a>
                          </span>
                          <span className={styles.accordionItemRight}>Xem PDF</span>
                        </div>
                      ) : (
                        <div className={styles.accordionPlaceholder}>Nội dung đang được cập nhật...</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className={styles.filterBar}>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className={styles.filterSelect}>
          <option value="">Tất cả môn</option>
          {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className={styles.filterSelect}>
          <option value="">Tất cả khối</option>
          {['6', '7', '8', '9'].map(g => <option key={g} value={g}>Khối {g}</option>)}
        </select>
        <select value={filterPublisher} onChange={e => setFilterPublisher(e.target.value)} className={styles.filterSelect}>
          <option value="">Tất cả NXB</option>
          {uniquePublishers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {hasFilter && <button className={styles.btnReset} onClick={resetFilters}>✕ Xóa bộ lọc</button>}
      </div>

      {docsLoading ? (
        <TableSkeleton cols={6} rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Không có tài liệu"
          message={hasFilter ? 'Không có sách nào khớp với bộ lọc.' : 'Chưa có sách giáo khoa nào.'}
        />
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên sách</th><th>Môn học</th><th>Khối</th><th>Nhà xuất bản</th><th>Năm XB</th><th>Xem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tb => (
                <tr key={tb.id}>
                  <td><strong>{tb.title}</strong></td>
                  <td>{tb.subjectName}</td>
                  <td>Khối {tb.grade}</td>
                  <td>{tb.publisher || <span className={styles.cellMuted}>—</span>}</td>
                  <td>{tb.publicationYear || <span className={styles.cellMuted}>—</span>}</td>
                  <td>
                    <button className={styles.btnMeet} onClick={() => handleViewTextbook(tb)}>
                      📖 Xem sách
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default CustomerDocsTab
