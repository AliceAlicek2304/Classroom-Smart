import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import { useToast } from '../../components/Toast'
import { TableSkeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { useConfirm } from '../../hooks/useConfirm'
import accountAPI, { type Student } from '../../services/accountService'
import styles from './Admin.module.css'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/Pagination'

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const toast = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await accountAPI.getStudents()
      setStudents(response.data.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách học sinh')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (student: Student) => {
    const action = student.isActive ? 'vô hiệu hóa' : 'kích hoạt'
    const confirmed = await confirm({
      title: `${student.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} tài khoản`,
      message: `Bạn có chắc muốn ${action} tài khoản của "${student.fullName}"?`,
      confirmText: student.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      cancelText: 'Hủy',
      variant: student.isActive ? 'danger' : undefined
    })
    if (!confirmed) return
    try {
      await accountAPI.toggleActive(student.id)
      toast.success(`Đã ${action} tài khoản thành công!`)
      fetchStudents()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Lỗi khi ${action} tài khoản`)
    }
  }

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      s.username.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      s.email.toLowerCase().includes(searchKeyword.toLowerCase())
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && s.isActive) ||
      (filterStatus === 'inactive' && !s.isActive)
    return matchSearch && matchStatus
  })

  const activeCount = students.filter(s => s.isActive).length
  const inactiveCount = students.filter(s => !s.isActive).length
  const { paged, page, totalPages, total, pageSize, setPage } = usePagination(filteredStudents, 15)

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Students Management</h1>
            <p className={styles.subtitle}>Quản lý tài khoản học sinh trong hệ thống</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <div className={`${styles.statDot} ${styles.purple}`}></div>
              <span className={styles.statLabel}>Tổng:</span>
              <span className={styles.statValue}>{students.length}</span>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statDot} ${styles.green}`}></div>
              <span className={styles.statLabel}>Active:</span>
              <span className={styles.statValue}>{activeCount}</span>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statDot} ${styles.red}`}></div>
              <span className={styles.statLabel}>Inactive:</span>
              <span className={styles.statValue}>{inactiveCount}</span>
            </div>
          </div>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, username, email..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            style={{ padding: '0.625rem 1rem', borderRadius: '10px', border: '1.5px solid rgba(102,126,234,0.3)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã vô hiệu hóa</option>
          </select>
        </div>

        {loading ? (
          <TableSkeleton cols={7} />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="Không tìm thấy học sinh"
            message="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái."
          />
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ và tên</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Ngày sinh</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((student) => (
                  <tr key={student.id} style={{ opacity: student.isActive ? 1 : 0.6 }}>
                    <td>#{student.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className={styles.avatar}>
                          {student.avatar ? (
                            <img src={student.avatar.startsWith('http') ? student.avatar : `http://localhost:8080${student.avatar}`} alt={student.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            student.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
                          )}
                        </div>
                        <strong style={{ fontSize: '0.95rem' }}>{student.fullName}</strong>
                      </div>
                    </td>
                    <td style={{ color: '#718096' }}>{student.username}</td>
                    <td style={{ color: '#718096' }}>{student.email}</td>
                    <td style={{ color: '#718096' }}>
                      {student.birthDay ? new Date(student.birthDay).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${student.isActive ? styles.active : styles.inactive}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={student.isActive ? styles.btnDelete : styles.btnEdit}
                          onClick={() => handleToggleActive(student)}
                          title={student.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {student.isActive ? '🔒 Vô hiệu hóa' : '✅ Kích hoạt'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
        <ConfirmDialog />
      </div>
    </AdminLayout>
  )
}

export default StudentsPage
