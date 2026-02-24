import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerBrand}>
          <h3>🎓 Classroom Smart</h3>
          <p>Hệ thống quản lý học tập số của Trường THCS Ngô Quyền.</p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="YouTube">▶️</a>
            <a href="#" aria-label="Zalo">💬</a>
          </div>
        </div>
        <div className={styles.footerLinks}>
          <div>
            <h4>Hệ thống</h4>
            <a href="#">Trang chủ</a>
            <a href="#">Dành cho giáo viên</a>
            <a href="#">Dành cho học sinh</a>
            <a href="#">Quản trị viên</a>
          </div>
          <div>
            <h4>Tính năng</h4>
            <a href="#">Quản lý lớp học</a>
            <a href="#">Bài tập trực tuyến</a>
            <a href="#">Kiểm tra có đếm giờ</a>
            <a href="#">AI tạo câu hỏi MCQ</a>
          </div>
          <div>
            <h4>Tài nguyên</h4>
            <a href="#">Sách giáo khoa THCS</a>
            <a href="#">Ngân hàng câu hỏi</a>
            <a href="#">Hướng dẫn sử dụng</a>
            <a href="#">Hỗ trợ kỹ thuật</a>
          </div>
          <div>
            <h4>Chính sách</h4>
            <a href="#">Bảo mật thông tin</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Liên hệ</a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2026 Classroom Smart — Trường THCS Ngô Quyền. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  )
}

export default Footer
