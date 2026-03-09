import { useState, useEffect, useRef } from 'react'
import TeacherLayout from '../../components/TeacherLayout/TeacherLayout'
import { TableSkeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import assignmentAPI, {
  type AssignmentResponse,
  type AssignmentRequest,
  type QuestionRequest,
  type SubmissionResponse,
} from '../../services/assignmentService'
import classroomAPI, { type Classroom } from '../../services/classroomService'
import aiAPI, { type RateLimitStatus } from '../../services/aiService'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../hooks/useConfirm'
import styles from '../Admin/Admin.module.css'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/Pagination'

const EMPTY_QUESTION = (): QuestionRequest => ({
  content: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
})

const TeacherAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Submissions modal state
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
  const [submissionsAssignment, setSubmissionsAssignment] = useState<AssignmentResponse | null>(null)
  const [allSubmissions, setAllSubmissions] = useState<SubmissionResponse[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [filterSubClassroom, setFilterSubClassroom] = useState('')
  const [filterSubGrade, setFilterSubGrade] = useState('')
  const [filterSubSearch, setFilterSubSearch] = useState('')

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailSubmission, setDetailSubmission] = useState<SubmissionResponse | null>(null)

  // Main table filters
  const [filterAssignClassroom, setFilterAssignClassroom] = useState('')
  const [filterAssignGrade, setFilterAssignGrade] = useState('')
  const toast = useToast()
  const { confirm, confirmDialog } = useConfirm()

  // AI panel state
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiNumQuestions, setAiNumQuestions] = useState(5)
  const [aiFile, setAiFile] = useState<File | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiQuota, setAiQuota] = useState<RateLimitStatus | null>(null)
  const aiFileRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<AssignmentRequest>({
    title: '',
    description: '',
    dueDate: '',
    classroomIds: [],
    questions: [EMPTY_QUESTION()],
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!showAIPanel) return
    aiAPI.getRateLimitStatus().then(res => setAiQuota(res.data.data)).catch(() => {})
  }, [showAIPanel])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [aRes, cRes] = await Promise.all([
        assignmentAPI.getMy(),
        classroomAPI.getMyClassrooms(),
      ])
      setAssignments(aRes.data.data || [])
      setClassrooms(cRes.data.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      classroomIds: [],
      questions: [EMPTY_QUESTION()],
    })
    setShowAIPanel(false)
    setAiPrompt('')
    setAiFile(null)
    setAiNumQuestions(5)
    setShowModal(true)
  }

  const handleEdit = (a: AssignmentResponse) => {
    setEditingId(a.id)
    setFormData({
      title: a.title,
      description: a.description || '',
      dueDate: a.dueDate ? a.dueDate.slice(0, 16) : '',
      classroomIds: a.classroomIds || [],
      questions: a.questions.length > 0
        ? a.questions.map(q => ({
            content: q.content,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer as 'A' | 'B' | 'C' | 'D',
            orderNumber: q.orderNumber,
          }))
        : [EMPTY_QUESTION()],
    })
    setShowAIPanel(false)
    setAiPrompt('')
    setAiFile(null)
    setAiNumQuestions(5)
    setShowModal(true)
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() && !aiFile) {
      toast.error('Vui lòng nhập yêu cầu hoặc upload file PDF!')
      return
    }
    try {
      setAiLoading(true)
      let generated
      if (aiFile) {
        const res = await aiAPI.generateFromFile(aiFile, aiPrompt, aiNumQuestions)
        generated = res.data.data
      } else {
        const res = await aiAPI.generateFromText({ prompt: aiPrompt, numQuestions: aiNumQuestions })
        generated = res.data.data
      }
      if (!generated || generated.length === 0) {
        toast.error('AI không tạo được câu hỏi, thử lại với yêu cầu khác!')
        return
      }
      const newQuestions: QuestionRequest[] = generated.map(q => ({
        content: q.content,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
      }))
      setFormData(f => ({
        ...f,
        // Replace placeholder-only questions, else append
        questions: f.questions.length === 1 && !f.questions[0].content.trim()
          ? newQuestions
          : [...f.questions, ...newQuestions],
      }))
      toast.success(`✨ AI đã tạo ${newQuestions.length} câu hỏi!`)
      setShowAIPanel(false)
    } catch (error: any) {
      if (error.response?.status === 429) {
        const d = error.response.data
        toast.error(d?.message || 'Quá nhiều yêu cầu AI, thử lại sau!')
      } else {
        toast.error(error.response?.data?.message || 'Lỗi khi gọi AI, thử lại sau!')
      }
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề!')
      return
    }
    if (formData.questions.some(q => !q.content.trim())) {
      toast.error('Vui lòng nhập nội dung cho tất cả câu hỏi!')
      return
    }
    try {
      const payload: AssignmentRequest = {
        ...formData,
        dueDate: formData.dueDate || undefined,
        questions: formData.questions.map((q, i) => ({ ...q, orderNumber: i + 1 })),
      }
      if (editingId) {
        await assignmentAPI.update(editingId, payload)
        toast.success('Cập nhật bài tập thành công!')
      } else {
        await assignmentAPI.create(payload)
        toast.success('Tạo bài tập thành công!')
      }
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!')
    }
  }

  const handleDelete = async (id: number, title: string) => {
    const confirmed = await confirm({
      title: 'Xóa bài tập',
      message: `Bạn có chắc muốn xóa bài tập "${title}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      variant: 'danger',
    })
    if (!confirmed) return
    try {
      await assignmentAPI.delete(id)
      toast.success('Xóa bài tập thành công!')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa')
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await assignmentAPI.toggleActive(id)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật')
    }
  }

  const handleViewSubmissions = async (a: AssignmentResponse) => {
    setSubmissionsAssignment(a)
    setAllSubmissions([])
    setFilterSubClassroom('')
    setFilterSubGrade('')
    setFilterSubSearch('')
    setShowSubmissionsModal(true)
    setSubmissionsLoading(true)
    try {
      const res = await assignmentAPI.getAllSubmissions(a.id)
      setAllSubmissions(res.data.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải bài nộp')
    } finally {
      setSubmissionsLoading(false)
    }
  }

  // Question builder helpers
  const addQuestion = () =>
    setFormData(f => ({ ...f, questions: [...f.questions, EMPTY_QUESTION()] }))

  const removeQuestion = (idx: number) =>
    setFormData(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }))

  const updateQuestion = (idx: number, field: keyof QuestionRequest, value: string) =>
    setFormData(f => ({
      ...f,
      questions: f.questions.map((q, i) => i === idx ? { ...q, [field]: value } : q),
    }))

  // Classroom multi-select
  const toggleClassroom = (id: number) =>
    setFormData(f => ({
      ...f,
      classroomIds: f.classroomIds.includes(id)
        ? f.classroomIds.filter(c => c !== id)
        : [...f.classroomIds, id],
    }))

  // Build classroomName → grade map from loaded classrooms
  const classroomGradeMap = new Map(classrooms.map(c => [c.name, String(c.gradeLevel)]))

  const filtered = assignments.filter(a => {
    if (searchTerm.trim() && !a.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filterAssignClassroom && !a.classroomNames?.includes(filterAssignClassroom)) return false
    if (filterAssignGrade) {
      const hasGrade = (a.classroomIds || []).some(id => {
        const cr = classrooms.find(c => c.id === id)
        return cr && String(cr.gradeLevel) === filterAssignGrade
      })
      if (!hasGrade) return false
    }
    return true
  })

  const assignGrades = [...new Set(classrooms.map(c => String(c.gradeLevel)))].sort((a, b) => Number(a) - Number(b))
  const assignClassroomOptions = [...new Set(assignments.flatMap(a => a.classroomNames || []))].sort()
  const { paged, page, totalPages, total, pageSize, setPage } = usePagination(filtered)

  return (
    <TeacherLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Bài tập</h1>
            <p className={styles.subtitle}>Quản lý bài tập trắc nghiệm của bạn</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            ➕ Tạo bài tập mới
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Tìm theo tiêu đề..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '0.5rem 0.85rem', border: '2px solid var(--dark)', borderRadius: 8, background: 'var(--bg)', flex: 1, minWidth: 180, fontFamily: 'inherit' }}
          />
          <select
            value={filterAssignGrade}
            onChange={e => setFilterAssignGrade(e.target.value)}
            style={{ padding: '0.5rem 0.85rem', border: '2px solid var(--dark)', borderRadius: 8, background: 'var(--bg)', minWidth: 120, fontFamily: 'inherit' }}
          >
            <option value="">Tất cả khối</option>
            {assignGrades.map(g => <option key={g} value={g}>Khối {g}</option>)}
          </select>
          <select
            value={filterAssignClassroom}
            onChange={e => setFilterAssignClassroom(e.target.value)}
            style={{ padding: '0.5rem 0.85rem', border: '2px solid var(--dark)', borderRadius: 8, background: 'var(--bg)', minWidth: 160, fontFamily: 'inherit' }}
          >
            <option value="">Tất cả lớp</option>
            {assignClassroomOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(searchTerm || filterAssignGrade || filterAssignClassroom) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterAssignGrade(''); setFilterAssignClassroom('') }}
              style={{ padding: '0.5rem 0.85rem', border: '2px solid var(--dark)', borderRadius: 8, background: '#FEE2E2', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >✕ Xóa lọc</button>
          )}
        </div>

        {loading ? (
          <TableSkeleton cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Chưa có bài tập nào"
            message='Nhấn "Tạo bài tập" để thêm bài tập đầu tiên cho lớp học.'
            action={{ label: '+ Tạo bài tập', onClick: () => setShowModal(true) }}
          />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Số câu hỏi</th>
                  <th>Hạn nộp</th>
                  <th>Lớp học</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      {a.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--dark)', opacity: 0.6 }}>
                          {a.description.slice(0, 60)}{a.description.length > 60 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td>{a.totalQuestions} câu</td>
                    <td>{a.dueDate ? new Date(a.dueDate).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>{a.classroomNames?.join(', ') || '—'}</td>
                    <td>
                      <span className={a.isActive ? styles.badgeActive : styles.badgeInactive}>
                        {a.isActive ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        style={{ padding: '0.3rem 0.55rem', border: '2px solid var(--dark)', borderRadius: 8, background: '#DBEAFE', cursor: 'pointer', fontSize: '1rem', boxShadow: '2px 2px 0 var(--dark)', marginRight: 2 }}
                        onClick={() => handleViewSubmissions(a)}
                        title="Xem bài nộp"
                      >👥</button>
                      <button
                        className={styles.btnEdit}
                        onClick={() => handleEdit(a)}
                        title="Chỉnh sửa"
                      >✏️</button>
                      <button
                        className={a.isActive ? styles.btnToggleOff : styles.btnToggleOn}
                        onClick={() => handleToggleActive(a.id)}
                        title={a.isActive ? 'Ẩn' : 'Hiện'}
                      >
                        {a.isActive ? '🙈' : '👁️'}
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(a.id, a.title)}
                        title="Xóa"
                      >🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div
            className={styles.modal}
            style={{ maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}</h2>
              <button className={styles.btnClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="Nhập tiêu đề bài tập"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả bài tập (tùy chọn)"
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Hạn nộp</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Lớp học áp dụng</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {classrooms.map(c => (
                    <label
                      key={c.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px',
                        border: '2px solid var(--dark)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        background: formData.classroomIds.includes(c.id)
                          ? 'var(--purple)' : 'var(--bg)',
                        color: formData.classroomIds.includes(c.id) ? '#fff' : 'var(--dark)',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        userSelect: 'none',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.classroomIds.includes(c.id)}
                        onChange={() => toggleClassroom(c.id)}
                        style={{ display: 'none' }}
                      />
                      {c.name}
                    </label>
                  ))}
                  {classrooms.length === 0 && (
                    <span style={{ opacity: 0.5 }}>Chưa có lớp học nào</span>
                  )}
                </div>
              </div>

              {/* AI Panel */}
              <div style={{
                marginTop: 16,
                border: '2px solid var(--dark)',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '3px 3px 0 var(--dark)',
              }}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    background: showAIPanel ? 'var(--purple)' : '#f0ecff',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => setShowAIPanel(v => !v)}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: showAIPanel ? '#fff' : 'var(--dark)' }}>
                    ✨ Hỗ trợ AI — Tạo câu hỏi tự động
                  </span>
                  <span style={{ fontSize: '0.85rem', color: showAIPanel ? '#fff' : 'var(--dark)', opacity: 0.8 }}>
                    {showAIPanel ? '▲ Thu gọn' : '▼ Mở rộng'}
                  </span>
                </div>

                {showAIPanel && (
                  <div style={{ padding: 16, background: '#faf8ff', borderTop: '2px solid var(--dark)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--dark)', opacity: 0.7, marginBottom: 12 }}>
                      Mô tả chủ đề, nội dung câu hỏi cần tạo và/hoặc upload file PDF của chương học.
                    </p>

                    {aiQuota && (
                      <div style={{
                        background: '#fff', border: '1.5px solid var(--dark)', borderRadius: 8,
                        padding: '8px 12px', marginBottom: 14,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                          <span>🤖 Quota AI hôm nay</span>
                          <span style={{ color: aiQuota.dayRemaining === 0 ? '#ef4444' : aiQuota.dayRemaining <= 3 ? '#f97316' : 'var(--green)' }}>
                            {aiQuota.dayUsed}/{aiQuota.dayLimit} lượt
                          </span>
                        </div>
                        <div style={{ background: '#e5e7eb', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, (aiQuota.dayUsed / aiQuota.dayLimit) * 100)}%`,
                            background: aiQuota.dayRemaining === 0 ? '#ef4444' : aiQuota.dayRemaining <= 3 ? '#f97316' : 'var(--green)',
                            height: '100%', transition: 'width 0.3s',
                          }} />
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--gray)', marginTop: 4 }}>
                          {aiQuota.dayRemaining === 0
                            ? '⛔ Đã hết quota hôm nay'
                            : `Còn ${aiQuota.dayRemaining} lượt`
                          } · {aiQuota.minuteRemaining}/{aiQuota.minuteLimit} lượt/phút
                        </div>
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label>Yêu cầu cho AI</label>
                      <textarea
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="VĐ: Tạo câu hỏi về phép nhân ma trận lớp 12, mức độ trung bình..."
                        rows={3}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label>Số câu hỏi cần tạo</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={aiNumQuestions}
                          onChange={e => setAiNumQuestions(Number(e.target.value))}
                        />
                      </div>
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label>File PDF (tùy chọn)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={() => aiFileRef.current?.click()}
                            style={{
                              padding: '6px 12px', border: '2px solid var(--dark)',
                              borderRadius: 6, background: aiFile ? 'var(--green)' : 'var(--bg)',
                              cursor: 'pointer', fontWeight: 500, fontSize: '0.82rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            📎 {aiFile ? 'Đã chọn' : 'Chọn PDF'}
                          </button>
                          {aiFile && (
                            <span style={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {aiFile.name}
                              <button
                                type="button"
                                onClick={() => { setAiFile(null); if (aiFileRef.current) aiFileRef.current.value = '' }}
                                style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontWeight: 700 }}
                              >✕</button>
                            </span>
                          )}
                          <input
                            ref={aiFileRef}
                            type="file"
                            accept=".pdf"
                            style={{ display: 'none' }}
                            onChange={e => setAiFile(e.target.files?.[0] || null)}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={aiLoading}
                      style={{
                        width: '100%', padding: '10px 0',
                        border: '2px solid var(--dark)',
                        borderRadius: 8,
                        background: aiLoading ? 'var(--gray-light)' : 'var(--purple)',
                        color: aiLoading ? 'var(--dark)' : '#fff',
                        fontWeight: 700, fontSize: '0.95rem',
                        cursor: aiLoading ? 'not-allowed' : 'pointer',
                        boxShadow: aiLoading ? 'none' : '3px 3px 0 var(--dark)',
                        transition: 'all 0.1s',
                      }}
                    >
                      {aiLoading ? '⏳ Đang tạo câu hỏi...' : '✨ Tạo câu hỏi với AI'}
                    </button>
                  </div>
                )}
              </div>

              {/* Questions */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Câu hỏi ({formData.questions.length})
                  </label>
                  <button type="button" className={styles.btnCreate} onClick={addQuestion}
                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                    ➕ Thêm câu hỏi
                  </button>
                </div>

                {formData.questions.map((q, idx) => (
                  <div key={idx} style={{
                    border: '2px solid var(--dark)', borderRadius: 8, padding: 14,
                    marginBottom: 12, background: 'var(--bg)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700 }}>Câu {idx + 1}</span>
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#e53e3e', fontWeight: 700, fontSize: '1rem',
                          }}
                        >✕ Xóa</button>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Nội dung câu hỏi *</label>
                      <textarea
                        value={q.content}
                        onChange={e => updateQuestion(idx, 'content', e.target.value)}
                        placeholder="Nhập nội dung câu hỏi"
                        rows={2}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {(['A', 'B', 'C', 'D'] as const).map(opt => (
                        <div key={opt} className={styles.formGroup} style={{ margin: 0 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 22, height: 22, borderRadius: '50%',
                              background: q.correctAnswer === opt ? 'var(--green)' : 'var(--gray-light)',
                              border: '2px solid var(--dark)',
                              fontWeight: 700, fontSize: '0.75rem',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }} onClick={() => updateQuestion(idx, 'correctAnswer', opt)}>
                              {opt}
                            </span>
                            Đáp án {opt} {q.correctAnswer === opt && '✅'}
                          </label>
                          <input
                            type="text"
                            value={opt === 'A' ? q.optionA : opt === 'B' ? q.optionB : opt === 'C' ? q.optionC : q.optionD}
                            onChange={e => updateQuestion(idx, `option${opt}` as keyof QuestionRequest, e.target.value)}
                            placeholder={`Đáp án ${opt}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className={styles.formGroup} style={{ marginTop: 8 }}>
                      <label>Đáp án đúng</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(['A', 'B', 'C', 'D'] as const).map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateQuestion(idx, 'correctAnswer', opt)}
                            style={{
                              padding: '4px 14px',
                              border: '2px solid var(--dark)',
                              borderRadius: 6,
                              background: q.correctAnswer === opt ? 'var(--green)' : 'var(--bg)',
                              fontWeight: q.correctAnswer === opt ? 700 : 400,
                              cursor: 'pointer',
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnSave}>
                  {editingId ? 'Cập nhật' : 'Tạo bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog}

      {/* Submissions Modal */}
      {showSubmissionsModal && submissionsAssignment && (() => {
        // Build grade lookup from classrooms
        const classroomOptions = [...new Set(allSubmissions.map(s => s.classroomName || ''))].filter(c => c && c !== '—').sort()
        const gradeOptions = [...new Set(
          classroomOptions.map(c => classroomGradeMap.get(c)).filter(Boolean) as string[]
        )].sort((a, b) => Number(a) - Number(b))

        const filteredSubs = allSubmissions.filter(s => {
          if (filterSubClassroom && s.classroomName !== filterSubClassroom) return false
          if (filterSubGrade) {
            const grade = classroomGradeMap.get(s.classroomName || '')
            if (grade !== filterSubGrade) return false
          }
          if (filterSubSearch && !s.studentName.toLowerCase().includes(filterSubSearch.toLowerCase())) return false
          return true
        })
        return (
          <div className={styles.modalOverlay} onClick={() => setShowSubmissionsModal(false)}>
            <div
              className={styles.modal}
              style={{ maxWidth: 900, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>👥 Bài nộp: {submissionsAssignment.title}</h2>
                <button className={styles.btnClose} onClick={() => setShowSubmissionsModal(false)}>✕</button>
              </div>

              {/* Filters */}
              <div style={{ padding: '1rem 1.5rem 0', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="🔍 Tìm học sinh..."
                  value={filterSubSearch}
                  onChange={e => setFilterSubSearch(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', border: '2px solid var(--dark)', borderRadius: 8, background: 'var(--bg)', flex: 1, minWidth: 160, fontFamily: 'inherit' }}
                />
                <select
                  value={filterSubGrade}
                  onChange={e => { setFilterSubGrade(e.target.value); setFilterSubClassroom('') }}
                  style={{ padding: '0.45rem 0.8rem', border: '2px solid var(--dark)', borderRadius: 8, background: 'var(--bg)', minWidth: 120, fontFamily: 'inherit' }}
                >
                  <option value="">Tất cả khối</option>
                  {gradeOptions.map(g => <option key={g} value={g}>Khối {g}</option>)}
                </select>
                <select
                  value={filterSubClassroom}
                  onChange={e => setFilterSubClassroom(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', border: '2px solid var(--dark)', borderRadius: 8, background: 'var(--bg)', minWidth: 150, fontFamily: 'inherit' }}
                >
                  <option value="">Tất cả lớp</option>
                  {(filterSubGrade
                    ? classroomOptions.filter(c => classroomGradeMap.get(c) === filterSubGrade)
                    : classroomOptions
                  ).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {(filterSubSearch || filterSubGrade || filterSubClassroom) && (
                  <button
                    onClick={() => { setFilterSubSearch(''); setFilterSubGrade(''); setFilterSubClassroom('') }}
                    style={{ padding: '0.45rem 0.8rem', border: '2px solid var(--dark)', borderRadius: 8, background: '#FEE2E2', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                  >✕</button>
                )}
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--dark)', opacity: 0.65, marginLeft: 'auto' }}>
                  {filteredSubs.length} / {allSubmissions.length} bài nộp
                </span>
              </div>

              {/* Stats row */}
              <div style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: 16 }}>
                <div style={{ padding: '0.5rem 1rem', background: '#DBEAFE', border: '2px solid var(--dark)', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem' }}>
                  Tổng nộp: {allSubmissions.length}
                </div>
                {allSubmissions.length > 0 && (
                  <div style={{ padding: '0.5rem 1rem', background: '#DCFCE7', border: '2px solid var(--dark)', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem' }}>
                    Điểm TB: {(allSubmissions.reduce((sum, s) => sum + s.score, 0) / allSubmissions.length).toFixed(1)}
                  </div>
                )}
              </div>

              {submissionsLoading ? (
                <div className={styles.loading} style={{ padding: '2rem' }}>Đang tải...</div>
              ) : filteredSubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                  {allSubmissions.length === 0 ? 'Chưa có học sinh năo nộp bài.' : 'Không có kết quả khớp bộ lọc.'}
                </div>
              ) : (
                <div className={styles.tableWrapper} style={{ margin: '0 1.5rem 1.5rem' }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>STT</th>
                        <th>Học sinh</th>
                        <th>Lớp</th>
                        <th style={{ width: 100 }}>Điểm</th>
                        <th style={{ width: 110 }}>Số đúng</th>
                        <th>Thời gian nộp</th>
                        <th style={{ width: 90 }}>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubs.map((s, idx) => (
                        <tr key={s.id}>
                          <td style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.82rem' }}>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{s.studentName}</td>
                          <td style={{ fontSize: '0.85rem' }}>{s.classroomName || '—'}</td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: 6,
                              border: '2px solid var(--dark)',
                              fontWeight: 700,
                              background: s.score >= 8 ? '#DCFCE7' : s.score >= 5 ? '#FEF9C3' : '#FEE2E2',
                              fontSize: '0.9rem',
                            }}>{s.score.toFixed(1)}</span>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{s.correctCount}/{s.totalCount} câu</td>
                          <td style={{ fontSize: '0.82rem', opacity: 0.7 }}>
                            {new Date(s.submittedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <button
                              style={{ padding: '0.3rem 0.7rem', border: '2px solid var(--dark)', borderRadius: 8, background: 'var(--bg)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', boxShadow: '2px 2px 0 var(--dark)' }}
                              onClick={() => { setDetailSubmission(s); setShowDetailModal(true) }}
                            >📌 Xem</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Detail Modal */}
      {showDetailModal && detailSubmission && (
        <div className={styles.modalOverlay} style={{ zIndex: 10001 }} onClick={() => setShowDetailModal(false)}>
          <div
            className={styles.modal}
            style={{ maxWidth: 700, width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 style={{ margin: 0 }}>📋 Bài làm của {detailSubmission.studentName}</h2>
                <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: 2 }}>{detailSubmission.assignmentTitle}</div>
              </div>
              <button className={styles.btnClose} onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            {/* Score banner */}
            <div style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: 16, alignItems: 'center', borderBottom: '2px solid var(--dark)', background: detailSubmission.score >= 8 ? '#DCFCE7' : detailSubmission.score >= 5 ? '#FEF9C3' : '#FEE2E2' }}>
              <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>{detailSubmission.score.toFixed(1)}</span>
              <span style={{ fontWeight: 600 }}>{detailSubmission.correctCount}/{detailSubmission.totalCount} câu đúng</span>
              <span style={{ fontSize: '0.82rem', opacity: 0.7, marginLeft: 'auto' }}>
                Nộp lúc: {new Date(detailSubmission.submittedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Answers */}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {detailSubmission.answers.map((ans, qi) => {
                const question = submissionsAssignment?.questions.find(q => q.id === ans.questionId)
                const opts: Record<string, string> = {
                  A: question?.optionA ?? 'A',
                  B: question?.optionB ?? 'B',
                  C: question?.optionC ?? 'C',
                  D: question?.optionD ?? 'D',
                }
                return (
                  <div key={ans.questionId} style={{
                    border: `2px solid ${ans.isCorrect ? '#16A34A' : '#DC2626'}`,
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: `4px 4px 0 ${ans.isCorrect ? '#16A34A' : '#DC2626'}`,
                  }}>
                    <div style={{ padding: '0.6rem 1rem', background: ans.isCorrect ? '#DCFCE7' : '#FEE2E2', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ opacity: 0.6, fontWeight: 400, fontSize: '0.85rem' }}>Câu {qi + 1}</span>
                      <span>{ans.questionContent}</span>
                      <span style={{ marginLeft: 'auto' }}>{ans.isCorrect ? '✅' : '❌'}</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {(['A', 'B', 'C', 'D'] as const).map(opt => {
                        const isCorrect = opt === ans.correctAnswer
                        const isSelected = opt === ans.selectedAnswer
                        const bg = isCorrect ? '#DCFCE7' : isSelected && !isCorrect ? '#FEE2E2' : 'var(--bg)'
                        const border = isCorrect ? '2px solid #16A34A' : isSelected ? '2px solid #DC2626' : '2px solid #ccc'
                        return (
                          <div key={opt} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border, background: bg, display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.88rem' }}>
                            <span style={{ fontWeight: 700, minWidth: 20, opacity: 0.7 }}>{opt}.</span>
                            <span>{opts[opt]}</span>
                            {isCorrect && <span style={{ marginLeft: 'auto', color: '#16A34A', fontWeight: 700 }}>✓</span>}
                            {isSelected && !isCorrect && <span style={{ marginLeft: 'auto', color: '#DC2626', fontWeight: 700 }}>✗</span>}
                          </div>
                        )
                      })}
                    </div>
                    {!ans.selectedAnswer && (
                      <div style={{ padding: '0.3rem 1rem 0.7rem', fontSize: '0.82rem', color: '#DC2626', fontWeight: 600 }}>⚠️ Không chọn đáp án</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  )
}

export default TeacherAssignmentsPage
