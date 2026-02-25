import { useState, useEffect } from 'react'

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [items.length])

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const paged = items.slice(start, start + pageSize)

  return { paged, page: safePage, totalPages, total, pageSize, setPage }
}
