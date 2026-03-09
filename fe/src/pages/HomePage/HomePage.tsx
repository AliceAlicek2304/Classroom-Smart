import { useState } from 'react'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import { AuthModal } from '../../components/Auth'
import { useAuth } from '../../contexts'
import styles from './HomePage.module.css'

const HomePage = () => {
  const { isAuthenticated } = useAuth()
  const [authModal, setAuthModal] = useState<{isOpen: boolean, mode: 'login' | 'register'}>({  
    isOpen: false,
    mode: 'login'
  })

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModal({ isOpen: true, mode })
  }

  const subjects = [
    { id: 1, name: 'Toán học', icon: '📐', color: '#FFB5B5', desc: 'Đại số, Hình học, Thống kê' },
    { id: 2, name: 'Ngữ văn', icon: '📖', color: '#B5E7FF', desc: 'Đọc hiểu, Tập làm văn' },
    { id: 3, name: 'Vật lý', icon: '⚗️', color: '#B5FFD9', desc: 'Cơ học, Điện học, Quang học' },
    { id: 4, name: 'Hóa học', icon: '🧪', color: '#FFE4B5', desc: 'Hóa vô cơ, Hóa hữu cơ' },
    { id: 5, name: 'Lịch sử', icon: '🏛️', color: '#E5D5FF', desc: 'Lịch sử Việt Nam & Thế giới' },
    { id: 6, name: 'Địa lý', icon: '🌏', color: '#D5F0FF', desc: 'Địa lý tự nhiên, Kinh tế' },
  ]

  const steps = [
    { step: '01', title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản với email, xác thực qua email trong vài phút', icon: '✉️' },
    { step: '02', title: 'Tham gia lớp học', desc: 'Học sinh tìm và đăng ký lớp, giáo viên tạo lớp và thêm học sinh', icon: '🏫' },
    { step: '03', title: 'Học và kiểm tra', desc: 'Làm bài tập, thi kiểm tra có đếm giờ, xem điểm và đáp án chi tiết', icon: '🎯' },
  ]

  return (
    <div className={styles.homePage}>
      <Header />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            Hệ thống quản lý học tập
          </div>

          <h1 className={styles.heroTitle}>
            Hệ thống quản lý<br />
            <span className={styles.highlight}>học tập</span><br />
            thông minh
          </h1>

          <p className={styles.heroSubtitle}>
            Nền tảng số hỗ trợ giáo viên soạn bài tập, ra đề kiểm tra và theo dõi kết quả học tập của học sinh khối 6–9.
          </p>

          {!isAuthenticated && (
            <div className={styles.heroButtons}>
              <button
                onClick={() => openAuthModal('register')}
                className={styles.btnPrimary}
              >
                Đăng ký ngay →
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className={styles.btnSecondary}
              >
                Đăng nhập
              </button>
            </div>
          )}

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <h3>Khối 6–9</h3>
              <p>4 khối lớp THCS</p>
            </div>
            <div className={styles.statItem}>
              <h3>Tự động</h3>
              <p>AI tạo câu hỏi</p>
            </div>
            <div className={styles.statItem}>
              <h3>3 Vai trò</h3>
              <p>Admin · GV · HS</p>
            </div>
          </div>
        </div>

        <div className={styles.heroCard}>
          <div className={styles.demoCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} style={{ background: '#E5D5FF' }}>
                📋
              </div>
              <div>
                <h4>Kiểm tra Toán HK1</h4>
                <p>45 phút · 20 câu trắc nghiệm</p>
              </div>
            </div>

            <div className={styles.timerSection}>
              <div className={styles.timerLabel}>⏱️ Thời gian còn lại</div>
              <div className={styles.timerDisplay}>38:14</div>
            </div>

            <div className={styles.questionPreview}>
              <div className={styles.questionNum}>Câu 3 / 20</div>
              <p className={styles.questionText}>Giải phương trình: 2x + 6 = 0</p>
              <div className={styles.options}>
                <div className={styles.option}>A. x = -6</div>
                <div className={`${styles.option} ${styles.optionSelected}`}>B. x = -3</div>
                <div className={styles.option}>C. x = 3</div>
                <div className={styles.option}>D. x = 6</div>
              </div>
            </div>

            <button className={styles.continueBtn}>Câu tiếp theo →</button>
          </div>

          <div className={styles.floatingChip} style={{ top: '10px', right: '-18px' }}>
            🤖 AI tạo đề
          </div>
          <div className={styles.floatingChip} style={{ bottom: '90px', left: '-22px' }}>
            ⭐ Tự chấm điểm
          </div>
          <div className={styles.floatingChip} style={{ bottom: '20px', right: '8px' }}>
            🔒 Chống gian lận
          </div>
        </div>
      </section>

      <section id="subjects" className={styles.subjects}>
        <div className={styles.sectionBadge}>Môn học</div>
        <h2 className={styles.sectionTitle}>Đầy đủ các môn THCS</h2>
        <p className={styles.sectionSubtitle}>Theo chương trình sách giáo khoa Bộ GD&amp;ĐT, phân theo lớp và chương</p>

        <div className={styles.subjectGrid}>
          {subjects.map(subject => (
            <div key={subject.id} className={styles.subjectCard}>
              <div className={styles.subjectIcon} style={{ background: subject.color }}>
                {subject.icon}
              </div>
              <div className={styles.subjectInfo}>
                <h3>{subject.name}</h3>
                <p>{subject.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.aiSection}>
        <div className={styles.aiInner}>
          <div className={styles.aiContent}>
            <div className={styles.aiBadge}>🤖 Hỗ trợ AI</div>
            <h2>Tạo câu hỏi tự động<br />chỉ trong vài giây</h2>
            <p>
              Nhập nội dung bài học hoặc upload file PDF — AI tự động tạo bộ câu hỏi trắc nghiệm 4 đáp án A/B/C/D, phân bổ cân bằng. Từ 1 đến 20 câu, hoàn toàn bằng tiếng Việt.
            </p>
            <div className={styles.aiFeatures}>
              <div className={styles.aiFeatureItem}>
                <span>📄</span>
                <div>
                  <strong>Upload PDF</strong>
                  <p>Tải giáo án, tài liệu PDF — AI tự trích xuất nội dung</p>
                </div>
              </div>
              <div className={styles.aiFeatureItem}>
                <span>✍️</span>
                <div>
                  <strong>Nhập text</strong>
                  <p>Gõ trực tiếp nội dung cần ra câu hỏi</p>
                </div>
              </div>
              <div className={styles.aiFeatureItem}>
                <span>⚡</span>
                <div>
                  <strong>Tức thì</strong>
                  <p>Kết quả trong vài giây, sẵn sàng giao cho lớp</p>
                </div>
              </div>
            </div>
            {!isAuthenticated && (
              <button onClick={() => openAuthModal('register')} className={styles.btnPrimary}>
                Dùng thử ngay →
              </button>
            )}
          </div>

          <div className={styles.aiDemo}>
            <div className={styles.aiDemoCard}>
              <div className={styles.aiDemoHeader}>
                <span>🤖</span>
                <strong>AI Tạo Câu Hỏi</strong>
                <span className={styles.aiDemoBadge}>Tự động</span>
              </div>
              <div className={styles.aiDemoInput}>
                <div className={styles.aiDemoLabel}>📝 Nội dung bài học</div>
                <div className={styles.aiDemoText}>
                  "Phương trình bậc nhất một ẩn có dạng ax + b = 0 (a ≠ 0). Nghiệm của phương trình là x = -b/a..."
                </div>
              </div>
              <div className={styles.aiDemoArrow}>⬇ AI đang xử lý...</div>
              <div className={styles.aiDemoOutput}>
                <div className={styles.aiDemoQuestion}>
                  <strong>Câu 1:</strong> Phương trình 3x - 9 = 0 có nghiệm là?
                </div>
                <div className={styles.aiDemoOptions}>
                  <span>A. x = -9</span>
                  <span>B. x = -3</span>
                  <span className={styles.correct}>C. x = 3 ✓</span>
                  <span>D. x = 9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className={styles.howItWorks}>
        <div className={styles.sectionBadge}>Bắt đầu</div>
        <h2 className={styles.sectionTitle}>Chỉ 3 bước đơn giản</h2>

        <div className={styles.stepsGrid}>
          {steps.map(s => (
            <div key={s.step} className={styles.stepCard}>
              <div className={styles.stepNum}>{s.step}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaBadge}>� THCS Ngô Quyền</div>
          <h2>Hệ thống dành riêng<br />cho học sinh và giáo viên</h2>
          <p>Tài khoản được cấp bởi nhà trường. Liên hệ giáo viên chủ nhiệm hoặc Ban Giám Hiệu để được hỗ trợ.</p>
          {!isAuthenticated && (
            <div className={styles.ctaButtons}>
              <button
                onClick={() => openAuthModal('login')}
                className={styles.btnPrimary}
              >
                Đăng nhập →
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className={`${styles.btnSecondary} ${styles.btnLight}`}
              >
                Đăng ký tài khoản
              </button>
            </div>
          )}
        </div>
      </section>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialMode={authModal.mode}
      />

      <Footer />
    </div>
  )
}

export default HomePage
