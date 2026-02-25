import styles from './Pagination.module.css'

interface Props {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

const getPageNumbers = (page: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (page > 3) pages.push('...')
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i)
  if (page < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

const Pagination = ({ page, totalPages, total, pageSize, onPageChange }: Props) => {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const pageNums = getPageNumbers(page, totalPages)

  return (
    <div className={styles.wrapper}>
      <span className={styles.info}>
        {start}–{end} trong {total} kết quả
      </span>
      <div className={styles.pages}>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          title="Trang trước"
        >‹</button>
        {pageNums.map((n, i) =>
          n === '...'
            ? <span key={`e${i}`} className={styles.ellipsis}>…</span>
            : <button
                key={n}
                className={`${styles.btn} ${n === page ? styles.active : ''}`}
                onClick={() => onPageChange(n as number)}
              >{n}</button>
        )}
        <button
          className={styles.btn}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          title="Trang sau"
        >›</button>
      </div>
    </div>
  )
}

export default Pagination
