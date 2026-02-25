import styles from './TableSkeleton.module.css'

const WIDTH_CYCLE = ['medium', 'long', 'full', 'short', 'medium', 'long', 'short', 'medium', 'full'] as const
type Width = typeof WIDTH_CYCLE[number]

interface TableSkeletonProps {
  cols?: number
  rows?: number
}

export const TableSkeleton = ({ cols = 5, rows = 5 }: TableSkeletonProps) => {
  const headerWidths: Width[] = Array.from({ length: cols }, (_, i) => WIDTH_CYCLE[i % WIDTH_CYCLE.length])
  const rowWidths: Width[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => WIDTH_CYCLE[(r * 3 + c) % WIDTH_CYCLE.length])
  )

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            {headerWidths.map((w, i) => (
              <th key={i}>
                <span className={`${styles.headerCell} ${styles[w]}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowWidths.map((row, ri) => (
            <tr key={ri} className={styles.bodyRow}>
              {row.map((w, ci) => (
                <td key={ci}>
                  <span className={`${styles.skeletonLine} ${styles[w]}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface CardSkeletonProps {
  count?: number
}

export const CardSkeleton = ({ count = 5 }: CardSkeletonProps) => (
  <div className={styles.cardWrapper}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.skeletonCard}>
        <span className={styles.cardTitle} />
        <span className={styles.cardMeta} />
      </div>
    ))}
  </div>
)
