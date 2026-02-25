import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import assignmentAPI, {
  type AssignmentResponse,
  type SubmissionResponse,
} from '../../services/assignmentService'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../hooks/useConfirm'
import styles from './DoAssignmentPage.module.css'

const DoAssignmentPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null)

  const assignmentId = Number(id)

  useEffect(() => {
    if (!assignmentId) return
    const load = async () => {
      setLoading(true)
      try {
        const [aRes, hRes] = await Promise.all([
          assignmentAPI.getById(assignmentId),
          assignmentAPI.getMySubmissions(assignmentId),
        ])
        setAssignment(aRes.data.data)
        const subs: SubmissionResponse[] = hRes.data.data || []
        if (subs.length > 0) setSubmission(subs[0])
      } catch {
        toast.error('Không tải được bài tập')
        navigate('/customer/assignments')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [assignmentId])

  const isOverdue = assignment?.dueDate
    ? new Date(assignment.dueDate) < new Date()
    : false

  const hasSubmitted = submission !== null
  const canRevealAnswers = hasSubmitted && isOverdue

  const answeredCount = Object.keys(selected).length
  const totalQuestions = assignment?.questions?.length ?? 0

  const handleSubmit = async () => {
    if (!assignment) return
    const confirmed = await confirm({
      title: 'Nộp bài tập',
      message: `Nộp bài "${assignment.title}"? Bạn đã trả lời ${answeredCount}/${totalQuestions} câu. Lưu ý: bạn chỉ được nộp 1 lần!`,
      confirmText: 'Nộp bài',
      cancelText: 'Hủy',
      variant: 'info',
    })
    if (!confirmed) return
    setSubmitting(true)
    try {
      const answers = assignment.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: selected[q.id] ?? null,
      }))
      const res = await assignmentAPI.submit(assignmentId, { answers })
      setSubmission(res.data.data)
      toast.success('Nộp bài thành công! 🎉')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Không nộp được bài')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <main className={styles.main}>
          <p style={{ color: 'var(--gray)', padding: '2rem 0' }}>Đang tải bài tập...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!assignment) return null

  const OPTIONS = ['A', 'B', 'C', 'D'] as const
  const getOptionText = (q: AssignmentResponse['questions'][0], opt: string) => {
    if (opt === 'A') return q.optionA
    if (opt === 'B') return q.optionB
    if (opt === 'C') return q.optionC
    return q.optionD
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>

        {/* ── Page header ── */}
        <div className={styles.pageHeader}>
          <button className={styles.btnBack} onClick={() => navigate('/customer/assignments')}>
            ← Quay lại
          </button>
          <div className={styles.headerInfo}>
            <h1>{assignment.title}</h1>
            <div className={styles.metaRow}>
              <span>📝 {totalQuestions} câu hỏi</span>
              {assignment.dueDate && (
                <span>
                  ⏰ Hạn: {new Date(assignment.dueDate).toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              )}
              {isOverdue && <span className={styles.overdueBadge}>Đã quá hạn</span>}
              {hasSubmitted && <span className={styles.submittedBadge}>✓ Đã nộp</span>}
            </div>
          </div>
        </div>

        {/* ── Chưa nộp + quá hạn ── */}
        {!hasSubmitted && isOverdue && (
          <div className={styles.infoBox} style={{ borderColor: '#DC2626', color: '#DC2626', background: '#FEF2F2' }}>
            ⛔ Bài tập đã quá hạn. Bạn không thể nộp bài nữa.
          </div>
        )}

        {/* ── Đã nộp → hiện điểm ── */}
        {hasSubmitted && submission && (
          <div className={styles.resultCard}>
            <div className={`${styles.scoreNumber} ${submission.score >= 5 ? styles.pass : styles.fail}`}>
              {submission.score.toFixed(1)}
            </div>
            <div className={styles.scoreSub}>
              {submission.correctCount}/{submission.totalCount} câu đúng
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.84rem', color: 'var(--gray)' }}>
              Nộp lúc: {new Date(submission.submittedAt).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
            {!isOverdue && (
              <div className={styles.infoBox} style={{ marginTop: '1rem', textAlign: 'left' }}>
                🔒 Đáp án đúng sẽ được công bố sau khi bài tập hết hạn.
              </div>
            )}
          </div>
        )}

        {/* ── Đã nộp + quá hạn → review ── */}
        {canRevealAnswers && submission && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{
              fontWeight: 800, fontSize: '1rem', marginBottom: '1rem',
              borderBottom: '2px solid var(--dark)', paddingBottom: '0.5rem',
            }}>
              📖 Xem lại bài làm &amp; đáp án
            </h3>
            {submission.answers.map((ans, idx) => {
              const q = assignment.questions.find(q => q.id === ans.questionId)
              if (!q) return null
              return (
                <div key={q.id} className={styles.questionCard}>
                  <div className={styles.questionMeta}>Câu {idx + 1}</div>
                  <div className={styles.questionText}>{q.content}</div>
                  <div className={styles.options}>
                    {OPTIONS.map(opt => {
                      const isCorrectOpt = opt === ans.correctAnswer
                      const isSelectedOpt = opt === ans.selectedAnswer
                      let cls = styles.optionLabel
                      if (isCorrectOpt) cls += ` ${styles.resultCorrect}`
                      else if (isSelectedOpt && !ans.isCorrect) cls += ` ${styles.resultWrong}`
                      return (
                        <div key={opt} className={cls}>
                          <span className={styles.optionKey}>{opt}</span>
                          <span className={styles.optionText}>{getOptionText(q, opt)}</span>
                          {isCorrectOpt && <span style={{ marginLeft: 'auto' }}>✅</span>}
                          {isSelectedOpt && !isCorrectOpt && <span style={{ marginLeft: 'auto' }}>❌</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Chưa nộp, chưa quá hạn → làm bài ── */}
        {!hasSubmitted && !isOverdue && (
          <>
            <div className={styles.progressSticky}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: totalQuestions ? `${(answeredCount / totalQuestions) * 100}%` : '0%' }}
                />
              </div>
              <div className={styles.progressLabel}>
                {answeredCount}/{totalQuestions} câu đã trả lời
              </div>
            </div>

            {assignment.questions.map((q, idx) => (
              <div key={q.id} className={styles.questionCard}>
                <div className={styles.questionMeta}>Câu {idx + 1}</div>
                <div className={styles.questionText}>{q.content}</div>
                <div className={styles.options}>
                  {OPTIONS.map(opt => (
                    <label
                      key={opt}
                      className={`${styles.optionLabel}${selected[q.id] === opt ? ` ${styles.selected}` : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={selected[q.id] === opt}
                        onChange={() => setSelected(prev => ({ ...prev, [q.id]: opt }))}
                        style={{ display: 'none' }}
                      />
                      <span className={styles.optionKey}>{opt}</span>
                      <span className={styles.optionText}>{getOptionText(q, opt)}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className={styles.submitBar}>
              <span className={styles.submitInfo}>
                Đã trả lời <strong>{answeredCount}</strong> / {totalQuestions} câu
              </span>
              <button
                className={styles.btnSubmit}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Đang nộp...' : '📤 Nộp bài'}
              </button>
            </div>
          </>
        )}

      </main>
      <Footer />
      <ConfirmDialog />
    </div>
  )
}

export default DoAssignmentPage
