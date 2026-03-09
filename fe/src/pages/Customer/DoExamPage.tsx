import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudentLayout from '../../components/StudentLayout/StudentLayout'
import examAPI, {
  type ExamResponse,
  type ExamSubmissionResponse,
  type SubmitExamRequest,
} from '../../services/examService'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../hooks/useConfirm'
import styles from './DoExamPage.module.css'

const MAX_VIOLATIONS = 3

const DoExamPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { confirm, confirmDialog } = useConfirm()

  const [exam, setExam] = useState<ExamResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState<ExamSubmissionResponse | null>(null)

  // Timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null) // seconds
  const timerStarted = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Anti-cheat: tab switching
  const [violationCount, setViolationCount] = useState(0)
  const [showViolationWarning, setShowViolationWarning] = useState(false)
  const violationRef = useRef(0)

  // Refs to avoid stale closures in event handlers
  const selectedRef = useRef<Record<number, string>>({})
  const hasSubmittedRef = useRef(false)
  const examRef = useRef<ExamResponse | null>(null)
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const examId = Number(id)

  const shouldBlock = useCallback(() => {
    const currentExam = examRef.current
    return (
      !hasSubmittedRef.current &&
      currentExam !== null &&
      !(currentExam.dueDate && new Date(currentExam.dueDate) < new Date())
    )
  }, [])

  // Manual navigation guard (BrowserRouter does not support useBlocker)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const pendingNavRef = useRef<string | null>(null)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock()) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    const handlePopState = () => {
      if (shouldBlock()) {
        // Push state back to prevent the navigation
        window.history.pushState(null, '', window.location.href)
        pendingNavRef.current = '/customer/classrooms'
        setShowLeaveModal(true)
      }
    }
    // Push a dummy entry so popstate fires when user hits Back
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [shouldBlock])

  const safeNavigate = useCallback((path: string) => {
    if (shouldBlock()) {
      pendingNavRef.current = path
      setShowLeaveModal(true)
    } else {
      navigate(path)
    }
  }, [shouldBlock, navigate])

  useEffect(() => {
    if (submission) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [submission])

  const handleSelect = (questionId: number, answer: string) => {
    const updated = { ...selectedRef.current, [questionId]: answer }
    selectedRef.current = updated
    setSelected(updated)
  }

  // ── Core submit logic (shared by manual + auto) ─────────────────────────
  const doSubmit = useCallback(async (isAuto = false) => {
    if (!examRef.current || hasSubmittedRef.current) return
    hasSubmittedRef.current = true
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setSubmitting(true)
    try {
      const answers = examRef.current.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: selectedRef.current[q.id] ?? null,
      })) as SubmitExamRequest['answers']

      const res = await examAPI.submit(examId, { answers })
      setSubmission(res.data.data)
      if (isAuto) {
        toast.info('⏱️ Bài kiểm tra đã được nộp tự động.')
      } else {
        toast.success('🎉 Nộp bài kiểm tra thành công!')
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Không nộp được bài')
      hasSubmittedRef.current = false
    } finally {
      setSubmitting(false)
    }
  }, [examId, toast])

  // ── Load exam ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!examId) return
    const load = async () => {
      setLoading(true)
      try {
        const [eRes, sRes] = await Promise.all([
          examAPI.getById(examId),
          examAPI.getMySubmissions(examId),
        ])
        const examData = eRes.data.data
        examRef.current = examData
        setExam(examData)

        const subs: ExamSubmissionResponse[] = sRes.data.data || []
        if (subs.length > 0) {
          setSubmission(subs[0])
          hasSubmittedRef.current = true
        } else if (examData.duration) {
          // Only start timer if not yet submitted
          setTimeLeft(examData.duration * 60)
        }
      } catch {
        toast.error('Không tải được bài kiểm tra')
        navigate('/customer/classrooms')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [examId])

  // ── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || timerStarted.current || hasSubmittedRef.current) return
    timerStarted.current = true

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          doSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft !== null, doSubmit])

  // ── Tab visibility anti-cheat ────────────────────────────────────────────
  useEffect(() => {
    if (hasSubmittedRef.current) return

    const handler = () => {
      if (!document.hidden || hasSubmittedRef.current) return
      violationRef.current += 1
      setViolationCount(violationRef.current)

      if (violationRef.current >= MAX_VIOLATIONS) {
        doSubmit(true)
      } else {
        setShowViolationWarning(true)
      }
    }

    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [doSubmit])

  // ── Beforeunload warning ─────────────────────────────────────────────────
  useEffect(() => {
    if (hasSubmittedRef.current || !exam) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [exam, submission])

  // ── Manual submit ────────────────────────────────────────────────────────
  const handleManualSubmit = async () => {
    if (!exam) return
    const answeredCount = Object.keys(selected).length
    const totalQuestions = exam.questions.length
    const confirmed = await confirm({
      title: 'Nộp bài kiểm tra',
      message: `Nộp bài "${exam.title}"? Bạn đã trả lời ${answeredCount}/${totalQuestions} câu. Lưu ý: bạn chỉ được nộp 1 lần!`,
      confirmText: 'Nộp bài',
      cancelText: 'Hủy',
      variant: 'info',
    })
    if (!confirmed) return
    doSubmit(false)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const OPTIONS = ['A', 'B', 'C', 'D'] as const
  const getOptionText = (q: ExamResponse['questions'][0], opt: string) => {
    if (opt === 'A') return q.optionA
    if (opt === 'B') return q.optionB
    if (opt === 'C') return q.optionC
    return q.optionD
  }

  // ── Derived state ────────────────────────────────────────────────────────
  const isOverdue = exam?.dueDate ? new Date(exam.dueDate) < new Date() : false
  const hasSubmitted = submission !== null
  const canRevealAnswers = hasSubmitted && isOverdue
  const answeredCount = Object.keys(selected).length
  const totalQuestions = exam?.questions?.length ?? 0
  const isTimeLow = timeLeft !== null && timeLeft <= 60

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <StudentLayout>
        <main className={styles.main}>
          <p style={{ color: 'var(--gray)', padding: '2rem 0' }}>Đang tải bài kiểm tra...</p>
        </main>
      </StudentLayout>
    )
  }

  if (!exam) return null

  return (
    <StudentLayout>
      <main className={styles.main}>

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className={styles.pageHeader}>
          {hasSubmitted && (
            <button className={styles.btnBack} onClick={() => safeNavigate('/customer/classrooms')}>
              ← Quay lại
            </button>
          )}
          <div className={styles.headerInfo}>
            <h1>{exam.title}</h1>
            <div className={styles.metaRow}>
              <span>📝 {totalQuestions} câu hỏi</span>
              {exam.duration && <span>⏱️ {exam.duration} phút</span>}
              {exam.dueDate && (
                <span>
                  🗓️ Hạn: {new Date(exam.dueDate).toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              )}
              {isOverdue && <span className={styles.overdueBadge}>Đã hết hạn</span>}
              {hasSubmitted && <span className={styles.submittedBadge}>✓ Đã nộp</span>}
            </div>
          </div>

          {/* Timer — only show while actively doing exam */}
          {!hasSubmitted && !isOverdue && timeLeft !== null && (
            <div className={`${styles.timerBox} ${isTimeLow ? styles.timerLow : ''}`}>
              <span className={styles.timerIcon}>⏱</span>
              <span className={styles.timerValue}>{formatTime(timeLeft)}</span>
              {isTimeLow && <span className={styles.timerLabel}>Sắp hết giờ!</span>}
            </div>
          )}
        </div>

        {/* ── Anti-cheat warning banner ────────────────────────────── */}
        {!hasSubmitted && !isOverdue && (
          <div className={styles.warnBanner}>
            🚫 Không được chuyển sang tab khác hoặc cửa sổ khác trong khi thi.
            {violationCount > 0 && (
              <strong> Vi phạm: {violationCount}/{MAX_VIOLATIONS}. Sẽ tự nộp bài nếu vi phạm {MAX_VIOLATIONS} lần.</strong>
            )}
          </div>
        )}

        {/* ── Violation warning modal ──────────────────────────────── */}
        {showViolationWarning && (
          <div className={styles.violationOverlay}>
            <div className={styles.violationModal}>
              <div className={styles.violationIcon}>⚠️</div>
              <h2 className={styles.violationTitle}>Cảnh báo vi phạm!</h2>
              <p className={styles.violationBody}>
                Bạn đã rời khỏi trang thi.
                <br />
                <strong>Lần vi phạm: {violationCount}/{MAX_VIOLATIONS}</strong>
                <br />
                {violationCount < MAX_VIOLATIONS
                  ? `Còn ${MAX_VIOLATIONS - violationCount} lần nữa — bài kiểm tra sẽ tự động nộp!`
                  : 'Bài kiểm tra đã bị nộp tự động.'}
              </p>
              <button
                className={styles.violationBtn}
                onClick={() => setShowViolationWarning(false)}
              >
                Tôi hiểu, tiếp tục thi
              </button>
            </div>
          </div>
        )}

        {/* ── Chưa nộp + quá hạn ──────────────────────────────────── */}
        {!hasSubmitted && isOverdue && (
          <div className={styles.infoBox} style={{ borderColor: '#DC2626', color: '#DC2626', background: '#FEF2F2' }}>
            ⛔ Bài kiểm tra đã hết hạn. Bạn không thể nộp bài nữa.
          </div>
        )}

        {/* ── Đã nộp → hiện kết quả ───────────────────────────────── */}
        {hasSubmitted && submission && (
          <div className={styles.resultCard}>
            <div className={styles.scoreRingWrap}>
              <svg viewBox="0 0 100 100" className={styles.scoreRing}>
                <circle cx="50" cy="50" r="38" className={styles.scoreRingBg} />
                <circle
                  cx="50" cy="50" r="38"
                  className={`${styles.scoreRingFill} ${submission.score >= 5 ? styles.pass : styles.fail}`}
                  style={{ strokeDashoffset: 238.76 * (1 - submission.score / 10) }}
                />
              </svg>
              <div className={styles.scoreRingCenter}>
                <div className={`${styles.scoreNumber} ${submission.score >= 5 ? styles.pass : styles.fail}`}>
                  {submission.score.toFixed(1)}
                </div>
                <div className={styles.scoreSlash}>/10</div>
              </div>
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
                🔒 Đáp án đúng sẽ được công bố sau khi bài kiểm tra hết hạn.
              </div>
            )}
          </div>
        )}

        {/* ── Đã nộp + quá hạn → xem đáp án ─────────────────────── */}
        {canRevealAnswers && submission && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{
              fontWeight: 800, fontSize: '1rem', marginBottom: '1rem',
              borderBottom: '2px solid var(--dark)', paddingBottom: '0.5rem',
            }}>
              📖 Xem lại bài làm &amp; đáp án
            </h3>
            {submission.answers.map((ans, idx) => {
              const q = exam.questions.find(q => q.id === ans.questionId)
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

        {/* ── Chưa nộp, chưa quá hạn, đang làm bài ───────────────── */}
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

            <div className={styles.examLayout}>
            <div>
            {exam.questions.map((q, idx) => (
              <div
                key={q.id}
                id={`q-${q.id}`}
                ref={el => { questionRefs.current[q.id] = el }}
                className={styles.questionCard}
              >
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
                        onChange={() => handleSelect(q.id, opt)}
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
                onClick={handleManualSubmit}
                disabled={submitting}
              >
                {submitting ? 'Đang nộp...' : '📤 Nộp bài'}
              </button>
            </div>
            </div>

            <aside className={styles.navSidebar}>
              <div className={styles.navTitle}>📋 Điều hướng</div>
              <div className={styles.navGrid}>
                {exam.questions.map((q, qi) => (
                  <button
                    key={q.id}
                    className={`${styles.navBtn}${selected[q.id] ? ` ${styles.navBtnAnswered}` : ''}`}
                    onClick={() => document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    {qi + 1}
                  </button>
                ))}
              </div>
              <div className={styles.navStats}>
                <span className={styles.navAnsweredCount}>{answeredCount}</span>/{totalQuestions}
                <span className={styles.navStatsLabel}> đã trả lời</span>
              </div>
            </aside>
            </div>
          </>
        )}

        {showLeaveModal && (
          <div className={styles.blockerOverlay}>
            <div className={styles.blockerModal}>
              <div className={styles.blockerIcon}>⚠️</div>
              <h2 className={styles.blockerTitle}>Rời khỏi bài thi?</h2>
              <p className={styles.blockerBody}>
                Bạn đang làm bài kiểm tra. Nếu rời khỏi trang, bài kiểm tra sẽ không được nộp.
              </p>
              <div className={styles.blockerActions}>
                <button className={styles.blockerBtnContinue} onClick={() => {
                  setShowLeaveModal(false)
                  pendingNavRef.current = null
                }}>
                  Tiếp tục thi
                </button>
                <button className={styles.blockerBtnLeave} onClick={() => {
                  const dest = pendingNavRef.current || '/customer/classrooms'
                  pendingNavRef.current = null
                  setShowLeaveModal(false)
                  navigate(dest)
                }}>
                  Rời trang
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      {confirmDialog}
    </StudentLayout>
  )
}

export default DoExamPage
