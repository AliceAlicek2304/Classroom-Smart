import { useState, useEffect, useRef } from 'react'
import TeacherLayout from '../../components/TeacherLayout/TeacherLayout'
import assignmentAPI, {
  type AssignmentResponse,
  type AssignmentRequest,
  type QuestionRequest,
} from '../../services/assignmentService'
import classroomAPI, { type Classroom } from '../../services/classroomService'
import aiAPI from '../../services/aiService'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../hooks/useConfirm'
import styles from '../Admin/Admin.module.css'

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
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  // AI panel state
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiNumQuestions, setAiNumQuestions] = useState(5)
  const [aiFile, setAiFile] = useState<File | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
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
      toast.error(error.response?.data?.message || 'Lỗi khi gọi AI, thử lại sau!')
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

  const filtered = assignments.filter(a =>
    !searchTerm.trim() || a.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
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
                {filtered.map(a => (
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.noData}>Chưa có bài tập nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
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

                    <div className={styles.formGroup}>
                      <label>Yêu cầu cho AI</label>
                      <textarea
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="VD: Tạo câu hỏi về phép nhân ma trận lớp 12, mức độ trung bình..."
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

      <ConfirmDialog />
    </TeacherLayout>
  )
}

export default TeacherAssignmentsPage
