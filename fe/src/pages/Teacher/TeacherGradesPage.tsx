import { useState, useEffect, useRef } from 'react'
import TeacherLayout from '../../components/TeacherLayout/TeacherLayout'
import classroomAPI, { type Classroom } from '../../services/classroomService'
import gradeAPI, {
  type GradeBookResponse,
  type GradeColumnResponse,
  GRADE_TYPE_LABELS,
  GRADE_TYPE_COLORS,
} from '../../services/gradeService'
import examAPI, { type ExamResponse, EXAM_TYPE_OPTIONS } from '../../services/examService'
import { useToast } from '../../components/Toast'
import styles from '../Admin/Admin.module.css'
import gradeStyles from './TeacherGradesPage.module.css'
import Modal from '../../components/Modal/Modal'

const TeacherGradesPage = () => {
  const toast = useToast()

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null)
  const [gradeBook, setGradeBook] = useState<GradeBookResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const [editingCell, setEditingCell] = useState<{ gradeId: number | null; columnId: number; studentId: number } | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)

  // Wheel inside table → scroll horizontally
  useEffect(() => {
    const el = tableWrapperRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return // let natural horizontal scroll pass
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColType, setNewColType] = useState('QUIZ_15')
  const [addingColumn, setAddingColumn] = useState(false)

  // Exam picker state
  const [classroomExams, setClassroomExams] = useState<ExamResponse[]>([])
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)

  useEffect(() => {
    classroomAPI.getMyClassrooms().then(res => {
      setClassrooms(res.data.data || [])
    }).catch(() => {
      toast.error('Lỗi khi tải danh sách lớp')
    })
  }, [])

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const loadGradeBook = async (classroomId: number) => {
    setLoading(true)
    setGradeBook(null)
    try {
      const res = await gradeAPI.getGradeBook(classroomId)
      setGradeBook(res.data.data)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi tải bảng điểm')
    } finally {
      setLoading(false)
    }
  }

  const handleClassroomChange = (id: number) => {
    setSelectedClassroomId(id)
    setEditingCell(null)
    loadGradeBook(id)
    // Load exams for this classroom
    examAPI.getByClassroom(id).then(res => {
      setClassroomExams(res.data.data || [])
    }).catch(() => setClassroomExams([]))
  }

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '#aaa'
    if (score >= 8) return '#22c55e'
    if (score >= 5) return '#f59e0b'
    return '#ef4444'
  }

  const startEdit = (gradeId: number | null, columnId: number, studentId: number, currentScore: number | null | undefined) => {
    setEditingCell({ gradeId, columnId, studentId })
    setEditValue(currentScore !== null && currentScore !== undefined ? String(currentScore) : '')
  }

  const commitEdit = async () => {
    if (!editingCell || !gradeBook) return
    const raw = editValue.trim()
    let score: number | null = null
    if (raw !== '') {
      const parsed = parseFloat(raw)
      if (isNaN(parsed) || parsed < 0 || parsed > 10) {
        toast.error('Điểm phải từ 0 đến 10')
        return
      }
      score = parsed
    }
    if (editingCell.gradeId === null) {
      toast.error('Không tìm thấy ô điểm, hãy thử tải lại trang')
      setEditingCell(null)
      return
    }
    try {
      const res = await gradeAPI.updateGrade(editingCell.gradeId, score)
      const updated = res.data.data
      setGradeBook(prev => {
        if (!prev) return prev
        return {
          ...prev,
          rows: prev.rows.map(row => {
            if (row.studentId !== editingCell.studentId) return row
            return {
              ...row,
              grades: row.grades.map(g =>
                g.columnId === editingCell.columnId
                  ? { ...g, score: updated.score }
                  : g
              ),
            }
          }),
        }
      })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi lưu điểm')
    } finally {
      setEditingCell(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditingCell(null)
  }

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassroomId || !newColName.trim()) return
    setAddingColumn(true)
    try {
      const res = await gradeAPI.addColumn(selectedClassroomId, {
        name: newColName.trim(),
        type: newColType,
        examId: selectedExamId,
      })
      const newCol = res.data.data
      setShowAddColumn(false)
      setNewColName('')
      setNewColType('QUIZ_15')
      setSelectedExamId(null)
      // Reload full grade book to get auto-filled scores
      if (selectedClassroomId) loadGradeBook(selectedClassroomId)
      toast.success(selectedExamId
        ? `Đã thêm cột "${newCol.name}" và tự điền điểm từ bài kiểm tra`
        : `Đã thêm cột "${newCol.name}"`
      )
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi thêm cột')
    } finally {
      setAddingColumn(false)
    }
  }

  const handleDeleteColumn = async (col: GradeColumnResponse) => {
    if (!confirm(`Xóa cột "${col.name}"? Tất cả điểm trong cột này sẽ bị xóa.`)) return
    try {
      await gradeAPI.deleteColumn(col.id)
      toast.success(`Đã xóa cột "${col.name}"`)
      setGradeBook(prev => {
        if (!prev) return prev
        return {
          ...prev,
          columns: prev.columns.filter(c => c.id !== col.id),
          rows: prev.rows.map(row => ({
            ...row,
            grades: row.grades.filter(g => g.columnId !== col.id),
          })),
        }
      })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Lỗi khi xóa cột')
    }
  }

  return (
    <TeacherLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>📈 Bảng điểm</div>
            <div className={styles.subtitle}>Quản lý điểm số học sinh theo lớp</div>
          </div>
          {selectedClassroomId && (
            <button className={styles.btnCreate} onClick={() => setShowAddColumn(true)}>
              ➕ Thêm cột điểm
            </button>
          )}
        </div>

        <div className={gradeStyles.classroomSelector}>
          <label>Chọn lớp học:</label>
          <select
            value={selectedClassroomId ?? ''}
            onChange={e => handleClassroomChange(Number(e.target.value))}
            className={gradeStyles.select}
          >
            <option value="">-- Chọn lớp --</option>
            {classrooms.filter(c => c.isActive).map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.subjectName} (Khối {c.gradeLevel}, {c.schoolYear})
              </option>
            ))}
          </select>
        </div>

        {loading && <div className={styles.loading}>Đang tải bảng điểm...</div>}

        {!loading && !selectedClassroomId && (
          <div className={styles.empty}>
            <h3>Chọn lớp học để xem bảng điểm</h3>
          </div>
        )}

        {!loading && gradeBook && (
          <>
            {gradeBook.rows.length === 0 ? (
              <div className={styles.empty}>
                <h3>Lớp chưa có học sinh nào</h3>
                <p>Thêm học sinh vào lớp để bắt đầu nhập điểm.</p>
              </div>
            ) : (
              <div className={gradeStyles.tableWrapper} ref={tableWrapperRef}>
                <table className={gradeStyles.gradeTable}>
                  <thead>
                    <tr>
                      <th className={gradeStyles.stickyCol}>STT</th>
                      <th className={gradeStyles.stickyCol2}>Học sinh</th>
                      {gradeBook.columns.map((col) => (
                        <th key={col.id} className={gradeStyles.colHeader}>
                          <div className={gradeStyles.colHeaderInner}>
                            <span
                              className={gradeStyles.typeBadge}
                              style={{ background: GRADE_TYPE_COLORS[col.type] }}
                            >
                              {GRADE_TYPE_LABELS[col.type] || col.type}
                            </span>
                            <span className={gradeStyles.colName}>{col.name}</span>
                            {col.isCustom && (
                              <button
                                className={gradeStyles.btnDeleteCol}
                                onClick={() => handleDeleteColumn(col)}
                                title="Xóa cột"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gradeBook.rows.map((row, idx) => (
                      <tr key={row.studentId}>
                        <td className={gradeStyles.stickyCol}>{idx + 1}</td>
                        <td className={gradeStyles.stickyCol2}>
                          <div className={gradeStyles.studentInfo}>
                            <span className={gradeStyles.studentName}>{row.studentName}</span>
                            <span className={gradeStyles.studentUsername}>@{row.username}</span>
                          </div>
                        </td>
                        {gradeBook.columns.map((col) => {
                          const entry = row.grades.find(g => g.columnId === col.id)
                          const isEditing =
                            editingCell?.studentId === row.studentId &&
                            editingCell?.columnId === col.id
                          return (
                            <td
                              key={col.id}
                              className={gradeStyles.scoreCell}
                              onClick={() => {
                                if (!isEditing) startEdit(entry?.gradeId ?? null, col.id, row.studentId, entry?.score)
                              }}
                            >
                              {isEditing ? (
                                <input
                                  ref={inputRef}
                                  className={gradeStyles.scoreInput}
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onBlur={commitEdit}
                                  onKeyDown={handleKeyDown}
                                  placeholder="0–10"
                                />
                              ) : (
                                <span
                                  className={gradeStyles.scoreValue}
                                  style={{ color: getScoreColor(entry?.score) }}
                                >
                                  {entry?.score !== null && entry?.score !== undefined
                                    ? entry.score
                                    : <span className={gradeStyles.emptyScore}>—</span>}
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={gradeStyles.hint}>
              💡 Click vào ô điểm để chỉnh sửa. Nhấn <kbd>Enter</kbd> để lưu, <kbd>Esc</kbd> để huỷ.
            </div>
          </>
        )}
      </div>

      {showAddColumn && (
        <Modal isOpen={showAddColumn} onClose={() => {
          setShowAddColumn(false)
          setSelectedExamId(null)
          setNewColName('')
          setNewColType('QUIZ_15')
        }}>
          <div className={gradeStyles.modalTitle}>➕ Thêm cột điểm</div>
          <form onSubmit={handleAddColumn}>
            <div className={gradeStyles.formGroup}>
              <label>Tên cột điểm</label>
              <input
                className={gradeStyles.formInput}
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                placeholder="Ví dụ: 15p lần 4, Thực hành..."
                autoFocus
                required
              />
            </div>
            <div className={gradeStyles.formGroup}>
              <label>Loại điểm</label>
              <select
                className={gradeStyles.formSelect}
                value={newColType}
                onChange={e => {
                  setNewColType(e.target.value)
                  setSelectedExamId(null)
                }}
              >
                <option value="QUIZ_15">15 phút</option>
                <option value="TEST_45">45 phút</option>
                <option value="MIDTERM">Giữa kỳ</option>
                <option value="FINAL">Cuối kỳ</option>
              </select>
            </div>

            {/* Exam picker — filtered to matching type */}
            {(() => {
              const typeMap: Record<string, string> = {
                QUIZ_15: 'QUIZ_15',
                TEST_45: 'TEST_45',
                MIDTERM: 'MIDTERM',
                FINAL: 'FINAL',
              }
              const matchingExams = classroomExams.filter(ex => ex.examType === typeMap[newColType])
              return (
                <div className={gradeStyles.formGroup}>
                  <label>
                    Tự điền điểm từ bài kiểm tra{' '}
                    <span style={{ opacity: 0.6, fontWeight: 400, fontSize: '0.85rem' }}>(tuỳ chọn)</span>
                  </label>
                  {matchingExams.length === 0 ? (
                    <div className={gradeStyles.examPickerEmpty}>
                      Không có bài kiểm tra {EXAM_TYPE_OPTIONS.find(o => o.value === newColType)?.label} nào trong lớp này
                    </div>
                  ) : (
                    <div className={gradeStyles.examPickerList}>
                      <label
                        className={`${gradeStyles.examPickerItem} ${selectedExamId === null ? gradeStyles.examPickerItemSelected : ''}`}
                        onClick={() => setSelectedExamId(null)}
                      >
                        <span className={gradeStyles.examPickerRadio}>{selectedExamId === null ? '●' : '○'}</span>
                        <span>Không tự điền</span>
                      </label>
                      {matchingExams.map(ex => (
                        <label
                          key={ex.id}
                          className={`${gradeStyles.examPickerItem} ${selectedExamId === ex.id ? gradeStyles.examPickerItemSelected : ''}`}
                          onClick={() => setSelectedExamId(ex.id)}
                        >
                          <span className={gradeStyles.examPickerRadio}>{selectedExamId === ex.id ? '●' : '○'}</span>
                          <span className={gradeStyles.examPickerName}>{ex.title}</span>
                          <span className={gradeStyles.examPickerMeta}>{ex.totalQuestions} câu · {ex.duration}ph</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {selectedExamId && (
                    <div className={gradeStyles.examPickerHint}>
                      ✨ Điểm của học sinh sẽ được tự điền từ bài kiểm tra đã chọn
                    </div>
                  )}
                </div>
              )
            })()}

            <div className={gradeStyles.modalActions}>
              <button
                type="button"
                className={gradeStyles.btnCancel}
                onClick={() => {
                  setShowAddColumn(false)
                  setSelectedExamId(null)
                  setNewColName('')
                  setNewColType('QUIZ_15')
                }}
              >
                Huỷ
              </button>
              <button
                type="submit"
                className={gradeStyles.btnSubmit}
                disabled={addingColumn}
              >
                {addingColumn ? 'Đang thêm...' : selectedExamId ? '➕ Thêm & tự điền điểm' : 'Thêm cột'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </TeacherLayout>
  )
}

export default TeacherGradesPage
