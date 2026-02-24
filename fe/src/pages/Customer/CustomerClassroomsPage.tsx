import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import classroomAPI, { type Classroom } from '../../services/classroomService'
import subjectAPI, { type Subject } from '../../services/subjectService'
import textbookAPI, { type Textbook } from '../../services/textbookService'
import chapterAPI, { type Chapter } from '../../services/chapterService'
import assignmentAPI, { type AssignmentResponse } from '../../services/assignmentService'
import examAPI, { type ExamResponse } from '../../services/examService'
import { useToast } from '../../components/Toast'
import profile from '../Common/ProfilePage.module.css'
import styles from '../Admin/Admin.module.css'

type TabType = 'mine' | 'all' | 'docs' | 'assignments'

const CustomerClassroomsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()

  const getInitialTab = (): TabType => {
    if (location.pathname === '/customer/classrooms') return 'all'
    if (location.pathname === '/customer/docs') return 'docs'
    if (location.pathname === '/customer/assignments') return 'assignments'
    return 'mine'
  }

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab)

  // My classrooms state
  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([])
  const [myLoading, setMyLoading] = useState(false)

  // All classrooms state
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [allLoading, setAllLoading] = useState(false)

  // Docs state
  const [textbooks, setTextbooks] = useState<Textbook[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [filterDocSubject, setFilterDocSubject] = useState('')
  const [filterDocGrade, setFilterDocGrade] = useState('')
  const [filterDocPublisher, setFilterDocPublisher] = useState('')
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(false)
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set())

  // Assignments/Exams tab state
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null)
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([])
  const [exams, setExams] = useState<ExamResponse[]>([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)

  const toggleChapter = (id: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Classroom filters
  const [filterSubject, setFilterSubject] = useState('')
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterSchoolYear, setFilterSchoolYear] = useState('')

  // Enroll modal state
  const [enrollTarget, setEnrollTarget] = useState<Classroom | null>(null)
  const [enrollPassword, setEnrollPassword] = useState('')
  const [enrollLoading, setEnrollLoading] = useState(false)

  useEffect(() => {
    setActiveTab(getInitialTab())
  }, [location.pathname])

  useEffect(() => {
    resetFilters()
    if (activeTab === 'mine') fetchMine()
    else if (activeTab === 'all') { fetchAll(); fetchMine() }
    else if (activeTab === 'docs') fetchDocs()
    else if (activeTab === 'assignments') fetchMine()
  }, [activeTab])

  const resetFilters = () => {
    setFilterSubject('')
    setFilterTeacher('')
    setFilterGrade('')
    setFilterSchoolYear('')
    setFilterDocSubject('')
    setFilterDocGrade('')
    setFilterDocPublisher('')
  }

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

  const fetchDocs = async () => {
    setDocsLoading(true)
    setSelectedTextbook(null)
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

  const handleViewTextbook = async (tb: Textbook) => {
    setSelectedTextbook(tb)
    setExpandedChapters(new Set())
    setChaptersLoading(true)
    try {
      const res = await chapterAPI.getByTextbook(tb.id)
      const active = (res.data || []).filter((c: Chapter) => c.isActive)
      active.sort((a: Chapter, b: Chapter) => a.chapterNumber - b.chapterNumber)
      setChapters(active)
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi tải chương')
    } finally {
      setChaptersLoading(false)
    }
  }

  const fetchAll = async () => {
    setAllLoading(true)
    try {
      const [classroomsRes, subjectsRes] = await Promise.all([
        classroomAPI.getAll(),
        subjectAPI.getActive()
      ])
      const active: Classroom[] = (classroomsRes.data.data || []).filter((c: Classroom) => c.isActive)
      setAllClassrooms(active)
      setSubjects((subjectsRes as { data: Subject[] }).data || [])
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi tải danh sách lớp')
    } finally {
      setAllLoading(false)
    }
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedTextbook(null)
    if (tab === 'mine') navigate('/customer/my-classrooms')
    else if (tab === 'all') navigate('/customer/classrooms')
    else if (tab === 'docs') navigate('/customer/docs')
    else navigate('/customer/assignments')
  }

  const fetchAssignmentsForClassroom = async (classroomId: number) => {
    setSelectedClassroomId(classroomId)
    setAssignmentsLoading(true)
    try {
      const [aRes, eRes] = await Promise.all([
        assignmentAPI.getByClassroom(classroomId),
        examAPI.getByClassroom(classroomId),
      ])
      setAssignments((aRes.data.data || []).filter((a: AssignmentResponse) => a.isActive))
      setExams((eRes.data.data || []).filter((e: ExamResponse) => e.isActive))
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi tải bài tập')
    } finally {
      setAssignmentsLoading(false)
    }
  }

  const currentList = activeTab === 'mine' ? myClassrooms.filter(c => c.isActive) : allClassrooms

  const uniqueSubjects = activeTab === 'all'
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
  const loading = activeTab === 'mine' ? myLoading : allLoading

  // Docs computed
  const uniqueDocSubjects = [...new Set(textbooks.map(t => t.subjectName))].filter(Boolean).sort() as string[]
  const uniqueDocPublishers = [...new Set(textbooks.map(t => t.publisher))].filter(Boolean).sort()
  const filteredDocs = textbooks.filter(t => {
    if (filterDocSubject && t.subjectName !== filterDocSubject) return false
    if (filterDocGrade && String(t.grade) !== filterDocGrade) return false
    if (filterDocPublisher && t.publisher !== filterDocPublisher) return false
    return true
  })
  const hasDocFilter = filterDocSubject || filterDocGrade || filterDocPublisher

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

  return (
    <div className={profile.profileWrapper}>
      <Header />

      <main className={profile.profileContent}>
        {/* Sidebar */}
        <aside className={profile.internalSidebar}>
          <div className={profile.sidebarTitle}>📚 Khóa học</div>
          <nav className={profile.sidebarNav}>
            <div
              className={`${profile.navItem} ${activeTab === 'mine' ? profile.navItemActive : ''}`}
              onClick={() => handleTabChange('mine')}
            >
              <span className={profile.navIcon}>🎒</span>
              Lớp của tôi
            </div>
            <div
              className={`${profile.navItem} ${activeTab === 'all' ? profile.navItemActive : ''}`}
              onClick={() => handleTabChange('all')}
            >
              <span className={profile.navIcon}>🏫</span>
              Tất cả các lớp
            </div>
            <div
              className={`${profile.navItem} ${activeTab === 'docs' ? profile.navItemActive : ''}`}
              onClick={() => handleTabChange('docs')}
            >
              <span className={profile.navIcon}>📖</span>
              Tài liệu
            </div>
            <div
              className={`${profile.navItem} ${activeTab === 'assignments' ? profile.navItemActive : ''}`}
              onClick={() => handleTabChange('assignments')}
            >
              <span className={profile.navIcon}>📝</span>
              Bài tập &amp; Kiểm tra
            </div>
          </nav>
        </aside>

        {/* Main panel */}
        <section>
          <div className={profile.mainPanel}>
            <div className={profile.panelHeader}>
              {activeTab === 'mine' && <><h2>🎒 Lớp của tôi</h2><p>Các lớp học bạn đang tham gia</p></>}
              {activeTab === 'all' && <><h2>🏫 Tất cả các lớp</h2><p>Khám phá và đăng ký lớp học phù hợp với bạn</p></>}
              {activeTab === 'docs' && !selectedTextbook && <><h2>📖 Tài liệu</h2><p>Sách giáo khoa đang hoạt động</p></>}
              {activeTab === 'docs' && selectedTextbook && <><h2>📑 Danh sách chương</h2><p>{selectedTextbook.title}</p></>}
              {activeTab === 'assignments' && <><h2>📝 Bài tập &amp; Kiểm tra</h2><p>Chọn lớp học để xem bài tập và bài kiểm tra</p></>}
            </div>

            {/* Classrooms filters & table */}
            {activeTab !== 'docs' && activeTab !== 'assignments' && (
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
                  <div className={styles.loading}>Đang tải...</div>
                ) : filtered.length === 0 ? (
                  <div className={styles.empty}>
                    {activeTab === 'mine' ? (
                      <><h3>Chưa có lớp nào</h3><p>{hasFilter ? 'Không có lớp nào khớp với bộ lọc.' : 'Bạn chưa tham gia lớp học nào. Vào "Tất cả các lớp" để đăng ký.'}</p></>
                    ) : (
                      <><h3>Không tìm thấy lớp học</h3><p>Thử thay đổi bộ lọc để xem thêm lớp học.</p></>
                    )}
                  </div>
                ) : (
                  <div className={styles.tableCard}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Tên lớp</th><th>Môn học</th><th>Giáo viên</th><th>Khối</th><th>Năm học</th><th>Học sinh</th>
                          <th>{activeTab === 'mine' ? 'Meet' : 'Đăng ký'}</th>
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
                              {activeTab === 'mine' ? (
                                classroom.meetUrl
                                  ? <a href={classroom.meetUrl} target="_blank" rel="noopener noreferrer" className={styles.btnMeet}>🎥 Tham gia</a>
                                  : <span className={styles.cellMuted}>—</span>
                              ) : myClassrooms.some(m => m.id === classroom.id) ? (
                                <span style={{
                                  display: 'inline-block',
                                  padding: '0.35rem 0.75rem',
                                  background: 'var(--green-bg)',
                                  color: 'var(--green-dark)',
                                  border: '1.5px solid var(--green)',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
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
              </>
            )}

            {/* Docs tab */}
            {activeTab === 'docs' && (
              <>
                {selectedTextbook ? (
                  // Chapter view — accordion style
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
                      <div className={styles.loading}>Đang tải chương...</div>
                    ) : chapters.length === 0 ? (
                      <div className={styles.empty}>
                        <h3>Chưa có chương nào</h3>
                        <p>Sách này chưa có chương nào được cập nhật.</p>
                      </div>
                    ) : (
                      <div className={styles.accordion}>
                        {chapters.map(ch => {
                          const isOpen = expandedChapters.has(ch.id)
                          return (
                            <div key={ch.id} className={`${styles.accordionRow} ${isOpen ? styles.accordionOpen : ''}`}>
                              <div className={styles.accordionHeader} onClick={() => toggleChapter(ch.id)}>
                                <div className={styles.accordionToggle}>{isOpen ? '−' : '+'}</div>
                                <span className={styles.accordionTitle}>{ch.chapterNumber}. {ch.title}</span>
                                {ch.pdfUrl && (
                                  <span className={styles.accordionMeta}>📎 PDF</span>
                                )}
                              </div>
                              {isOpen && (
                                <div className={styles.accordionBody}>
                                  {ch.pdfUrl ? (
                                    <div className={styles.accordionItem}>
                                      <span className={styles.accordionItemIcon}>📄</span>
                                      <span className={styles.accordionItemTitle}>
                                        <a
                                          href={`http://localhost:8080${ch.pdfUrl}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Nội dung chương {ch.chapterNumber}
                                          {ch.description ? ` — ${ch.description}` : ''}
                                        </a>
                                      </span>
                                      <span className={styles.accordionItemRight}>Xem PDF</span>
                                    </div>
                                  ) : (
                                    <div className={styles.accordionPlaceholder}>
                                      Nội dung đang được cập nhật...
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  // Textbook list
                  <>
                    <div className={styles.filterBar}>
                      <select value={filterDocSubject} onChange={e => setFilterDocSubject(e.target.value)} className={styles.filterSelect}>
                        <option value="">Tất cả môn</option>
                        {uniqueDocSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select value={filterDocGrade} onChange={e => setFilterDocGrade(e.target.value)} className={styles.filterSelect}>
                        <option value="">Tất cả khối</option>
                        {['6', '7', '8', '9'].map(g => <option key={g} value={g}>Khối {g}</option>)}
                      </select>
                      <select value={filterDocPublisher} onChange={e => setFilterDocPublisher(e.target.value)} className={styles.filterSelect}>
                        <option value="">Tất cả NXB</option>
                        {uniqueDocPublishers.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {hasDocFilter && <button className={styles.btnReset} onClick={resetFilters}>✕ Xóa bộ lọc</button>}
                    </div>
                    {docsLoading ? (
                      <div className={styles.loading}>Đang tải...</div>
                    ) : filteredDocs.length === 0 ? (
                      <div className={styles.empty}>
                        <h3>Không có tài liệu</h3>
                        <p>{hasDocFilter ? 'Không có sách nào khớp với bộ lọc.' : 'Chưa có sách giáo khoa nào.'}</p>
                      </div>
                    ) : (
                      <div className={styles.tableCard}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Tên sách</th><th>Môn học</th><th>Khối</th><th>Nhà xuất bản</th><th>Năm XB</th><th>Xem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDocs.map(tb => (
                              <tr key={tb.id}>
                                <td><strong>{tb.title}</strong></td>
                                <td>{tb.subjectName}</td>
                                <td>Khối {tb.grade}</td>
                                <td>{tb.publisher || <span className={styles.cellMuted}>—</span>}</td>
                                <td>{tb.publicationYear || <span className={styles.cellMuted}>—</span>}</td>
                                <td>
                                  <button
                                    className={styles.btnMeet}
                                    onClick={() => handleViewTextbook(tb)}
                                  >
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
                )}
              </>
            )}
            {/* Assignments & Exams tab */}
            {activeTab === 'assignments' && (
              <div>
                {myLoading ? (
                  <div className={styles.loading}>Đang tải danh sách lớp...</div>
                ) : myClassrooms.filter(c => c.isActive).length === 0 ? (
                  <div className={styles.empty}>
                    <h3>Chưa tham gia lớp học nào</h3>
                    <p>Đăng ký lớp học để xem bài tập và kiểm tra.</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.filterBar} style={{ marginBottom: 20 }}>
                      <select
                        value={selectedClassroomId ?? ''}
                        onChange={e => e.target.value ? fetchAssignmentsForClassroom(Number(e.target.value)) : setSelectedClassroomId(null)}
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
                      <div className={styles.empty}>
                        <p>Chọn một lớp học để xem bài tập và bài kiểm tra.</p>
                      </div>
                    )}

                    {selectedClassroomId && assignmentsLoading && (
                      <div className={styles.loading}>Đang tải...</div>
                    )}

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
                                  <tr>
                                    <th>Tiêu đề</th>
                                    <th>Số câu</th>
                                    <th>Hạn nộp</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {assignments.map(a => (
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
                                          ? new Date(a.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                          : <span className={styles.cellMuted}>—</span>}
                                      </td>
                                    </tr>
                                  ))}
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
                                  <tr>
                                    <th>Tiêu đề</th>
                                    <th>Số câu</th>
                                    <th>Thời gian</th>
                                    <th>Hạn thi</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {exams.map(e => (
                                    <tr key={e.id}>
                                      <td>
                                        <div style={{ fontWeight: 600 }}>{e.title}</div>
                                        {e.description && (
                                          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                            {e.description.slice(0, 80)}{e.description.length > 80 ? '…' : ''}
                                          </div>
                                        )}
                                      </td>
                                      <td>{e.totalQuestions} câu</td>
                                      <td>{e.duration} phút</td>
                                      <td>
                                        {e.dueDate
                                          ? new Date(e.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                          : <span className={styles.cellMuted}>—</span>}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Enroll Modal */}
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
    </div>
  )
}

export default CustomerClassroomsPage
