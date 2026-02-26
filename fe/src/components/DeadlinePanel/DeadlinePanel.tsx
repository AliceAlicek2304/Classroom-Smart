import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import assignmentAPI, { type AssignmentResponse } from '../../services/assignmentService'
import examAPI, { type ExamResponse } from '../../services/examService'
import styles from './DeadlinePanel.module.css'

interface DeadlineItem {
  id: number
  title: string
  kind: 'Bài tập' | 'Kiểm tra'
  dueDate: Date
  classrooms: string[]
  isActive: boolean
}

const URGENCY_COLORS: Record<string, string> = {
  overdue: '#ef4444',
  today:   '#f97316',
  soon:    '#f59e0b',
  week:    '#3b82f6',
}

function getDiffDays(due: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(due)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

function getUrgency(diffDays: number): 'overdue' | 'today' | 'soon' | 'week' {
  if (diffDays < 0)  return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 2)  return 'soon'
  return 'week'
}

function countdown(diffDays: number): string {
  if (diffDays < -1) return `Quá hạn ${-diffDays} ngày`
  if (diffDays === -1) return 'Quá hạn hôm qua'
  if (diffDays === 0)  return 'Hạn hôm nay!'
  if (diffDays === 1)  return 'Còn 1 ngày'
  return `Còn ${diffDays} ngày`
}

function buildItems(
  assignments: AssignmentResponse[],
  exams: ExamResponse[],
): DeadlineItem[] {
  const now = new Date()
  const cutoff = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000) // 8 days out
  const overdueLimit = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago

  const items: DeadlineItem[] = []

  for (const a of assignments) {
    if (!a.dueDate || !a.isActive) continue
    const d = new Date(a.dueDate)
    if (d < overdueLimit || d > cutoff) continue
    items.push({ id: a.id, title: a.title, kind: 'Bài tập', dueDate: d, classrooms: a.classroomNames || [], isActive: a.isActive })
  }

  for (const e of exams) {
    if (!e.dueDate || !e.isActive) continue
    const d = new Date(e.dueDate)
    if (d < overdueLimit || d > cutoff) continue
    items.push({ id: e.id, title: e.title, kind: 'Kiểm tra', dueDate: d, classrooms: e.classroomNames || [], isActive: e.isActive })
  }

  return items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}

export interface DeadlinePanelProps {
  mode?: 'teacher' | 'customer'
  compact?: boolean
}

export default function DeadlinePanel({ mode = 'teacher', compact = false }: DeadlinePanelProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<DeadlineItem[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (mode === 'customer') {
        const [aRes, eRes] = await Promise.all([
          assignmentAPI.getEnrolled(),
          examAPI.getEnrolled(),
        ])
        setItems(buildItems(aRes.data.data || [], eRes.data.data || []))
      } else {
        const [aRes, eRes] = await Promise.all([
          assignmentAPI.getMy(),
          examAPI.getMy(),
        ])
        setItems(buildItems(aRes.data.data || [], eRes.data.data || []))
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [mode])

  useEffect(() => {
    if (open) fetchData()
  }, [open, fetchData])

  // Group items
  const overdue = items.filter(i => getDiffDays(i.dueDate) < 0)
  const today   = items.filter(i => getDiffDays(i.dueDate) === 0)
  const upcoming = items.filter(i => getDiffDays(i.dueDate) > 0)
  const urgentCount = items.filter(i => getDiffDays(i.dueDate) <= 1).length

  const renderItem = (item: DeadlineItem) => {
    const diff = getDiffDays(item.dueDate)
    const urg  = getUrgency(diff)
    const col  = URGENCY_COLORS[urg]
    const kindColor = item.kind === 'Kiểm tra' ? '#7c3aed' : '#0ea5e9'
    return (
      <div key={`${item.kind}-${item.id}`} className={styles.item} style={{ '--urgency': col } as React.CSSProperties}>
        <div className={styles.itemTop}>
          <span className={styles.itemTitle}>{item.title}</span>
          <span className={styles.itemKind} style={{ background: kindColor }}>{item.kind}</span>
        </div>
        <div className={styles.itemMeta}>
          <span>📅 {item.dueDate.toLocaleDateString('vi-VN')}</span>
          {item.classrooms.length > 0 && (
            <span>🏫 {item.classrooms.join(', ')}</span>
          )}
        </div>
        <div className={styles.itemCountdown}>{countdown(diff)}</div>
      </div>
    )
  }

  const panel = open ? createPortal(
    <>
      <div className={styles.backdrop} onClick={() => setOpen(false)} />
      <div className={styles.panel} role="dialog" aria-label="Thông báo deadline">
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>🔔 Thông báo deadline</div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Đóng">✕</button>
        </div>
        <div className={styles.panelBody}>
          {loading ? (
            <div className={styles.loadingWrap}>
              {[1,2,3].map(i => <div key={i} className={styles.skLine} />)}
            </div>
          ) : items.length === 0 ? (
            <div className={styles.emptyWrap}>
              <div className={styles.emptyIcon}>🎉</div>
              <div className={styles.emptyTitle}>Không có deadline sắp tới</div>
              <div className={styles.emptyMsg}>Tất cả bài tập và kiểm tra đang ổn định. Không có deadline nào trong 7 ngày tới.</div>
            </div>
          ) : (
            <>
              {overdue.length > 0 && (
                <div className={styles.group}>
                  <div className={styles.groupLabel}>⛔ Đã quá hạn</div>
                  {overdue.map(renderItem)}
                </div>
              )}
              {today.length > 0 && (
                <div className={styles.group}>
                  <div className={styles.groupLabel}>🔥 Hết hạn hôm nay</div>
                  {today.map(renderItem)}
                </div>
              )}
              {upcoming.length > 0 && (
                <div className={styles.group}>
                  <div className={styles.groupLabel}>📆 Sắp hết hạn</div>
                  {upcoming.map(renderItem)}
                </div>
              )}
            </>
          )}
        </div>
        <div className={styles.panelFooter}>
          Hiển thị deadline trong vòng 7 ngày tới · Click ngoài để đóng
        </div>
      </div>
    </>,
    document.body
  ) : null

  return (
    <>
      <button
        className={compact ? styles.bellBtnCompact : styles.bellBtn}
        onClick={() => setOpen(v => !v)}
        aria-label="Xem thông báo deadline"
      >
        <span className={styles.bellIcon}>
          🔔
          {urgentCount > 0 && !open && (
            <span className={styles.badge}>{urgentCount > 9 ? '9+' : urgentCount}</span>
          )}
        </span>
        {!compact && 'Thông báo deadline'}
      </button>
      {panel}
    </>
  )
}
