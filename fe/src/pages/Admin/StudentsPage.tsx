import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout/AdminLayout'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../hooks/useConfirm'
import accountAPI, { type Student } from '../../services/accountService'
import styles from './Admin.module.css'

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

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Students Management</h1>
            <p className={styles.subtitle}>Quản lý tài khoản học sinh trong hệ thống</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600 }}>
              Tổng: {students.length}
            </div>
            <div style={{ background: 'linear-gradient(135deg, #48bb78, #38a169)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600 }}>
              Active: {activeCount}
            </div>
            <div style={{ background: 'linear-gradient(135deg, #fc8181, #e53e3e)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600 }}>
              Inactive: {inactiveCount}
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
          <div className={styles.loading}>Đang tải...</div>
        ) : filteredStudents.length === 0 ? (
          <div className={styles.empty}>
            <h3>Không tìm thấy học sinh</h3>
            <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} style={{ opacity: student.isActive ? 1 : 0.6 }}>
                    <td>#{student.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0
                        }}>
                          {student.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                        </div>
                        <strong>{student.fullName}</strong>
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
        <ConfirmDialog />
      </div>
    </AdminLayout>
  )
}

export default StudentsPage
