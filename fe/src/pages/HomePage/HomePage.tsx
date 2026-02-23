import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import { AuthModal } from '../../components/Auth'
import styles from './HomePage.module.css'

const HomePage = () => {
  const [authModal, setAuthModal] = useState<{isOpen: boolean, mode: 'login' | 'register'}>({
    isOpen: false,
    mode: 'login'
  })

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModal({ isOpen: true, mode })
  }

  const popularCourses = [
// ... (rest of the popularCourses array)
    {
      id: 1,
      title: 'Web Development Bootcamp',
      instructor: 'Sarah Chen',
      lessons: 48,
      duration: '24h',
      students: '12.5K',
      rating: 4.9,
      color: '#FFB5B5',
      icon: '</>'
    },
    {
      id: 2,
      title: 'UI/UX Design Mastery',
      instructor: 'Mike Johnson',
      lessons: 36,
      duration: '18h',
      students: '8.2K',
      rating: 4.8,
      color: '#B5E7FF',
      icon: '🎨'
    },
    {
      id: 3,
      title: 'Data Science with Python',
      instructor: 'Emily Davis',
      lessons: 52,
      duration: '30h',
      students: '15.3K',
      rating: 4.9,
      color: '#E5E5E5',
      icon: '📊'
    },
    {
      id: 4,
      title: 'Mobile App Development',
      instructor: 'Alex Kim',
      lessons: 42,
      duration: '22h',
      students: '9.8K',
      rating: 4.7,
      color: '#B5FFB5',
      icon: '📱'
    }
  ]

  const testimonials = [
    {
      id: 1,
      name: 'Jessica Lee',
      role: 'Web Developer',
      content: 'Best platform ever! Transformed my career in just 3 months.',
      avatar: '👩‍💻',
      rating: 5
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'UX Designer',
      content: 'The AI-powered learning made everything so much easier!',
      avatar: '👨‍🎨',
      rating: 5
    },
    {
      id: 3,
      name: 'Maria Garcia',
      role: 'Data Analyst',
      content: 'Interactive lessons and real projects helped me land my dream job.',
      avatar: '👩‍💼',
      rating: 5
    }
  ]

  return (
    <div className={styles.homePage}>
      <Header />
      
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            ✨ New: AI-Powered Learning
          </div>
          
          <h1 className={styles.heroTitle}>
            Learn Anything,<br />
            <span className={styles.highlight}>Anytime,</span><br />
            Anywhere!
          </h1>
          
          <p className={styles.heroSubtitle}>
            Join millions of learners worldwide. Access 10,000+ courses taught by expert instructors.
          </p>
          
          <div className={styles.heroButtons}>
            <button 
              onClick={() => openAuthModal('register')} 
              className={styles.btnPrimary}
            >
              Start Learning Free →
            </button>
            <Link to="/" className={styles.btnSecondary}>
              Browse Courses
            </Link>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <h3>10K+</h3>
              <p>Courses</p>
            </div>
            <div className={styles.statItem}>
              <h3>2M+</h3>
              <p>Students</p>
            </div>
            <div className={styles.statItem}>
              <h3>500+</h3>
              <p>Instructors</p>
            </div>
          </div>
        </div>
        
        <div className={styles.heroCard}>
          <div className={styles.demoCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} style={{ background: '#B5E7FF' }}>
                💻
              </div>
              <div>
                <h4>Web Development</h4>
                <p>12 lessons • 4h 30m</p>
              </div>
            </div>
            
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>Progress</span>
                <span className={styles.progressPercent}>65%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <button className={styles.continueBtn}>Continue Learning</button>
          </div>
          
          <div className={styles.floatingIcon} style={{ top: '20px', right: '20px' }}>
            🎯
          </div>
          <div className={styles.floatingIcon} style={{ bottom: '80px', left: '20px' }}>
            ⭐
          </div>
          <div className={styles.floatingIcon} style={{ bottom: '20px', right: '60px' }}>
            📚
          </div>
        </div>
      </section>

      <section className={styles.courses}>
        <div className={styles.sectionBadge}>Popular Courses</div>
        <h2 className={styles.sectionTitle}>Explore Top-Rated Courses</h2>
        <p className={styles.sectionSubtitle}>Learn from industry experts and gain real-world skills</p>
        
        <div className={styles.courseGrid}>
          {popularCourses.map(course => (
            <div key={course.id} className={styles.courseCard}>
              <div className={styles.courseIcon} style={{ background: course.color }}>
                {course.icon}
              </div>
              <div className={styles.courseContent}>
                <div className={styles.courseHeader}>
                  <h3>{course.title}</h3>
                  <div className={styles.rating}>
                    ⭐ {course.rating}
                  </div>
                </div>
                <p className={styles.instructor}>by {course.instructor}</p>
                <div className={styles.courseStats}>
                  <span>📚 {course.lessons} lessons</span>
                  <span>⏱️ {course.duration}</span>
                  <span>👥 {course.students}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.viewAllBtn}>
          <button 
            onClick={() => openAuthModal('register')} 
            className={styles.btnSecondary}
          >
            View All Courses →
          </button>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.sectionBadge}>Why Choose Us</div>
        <h2 className={styles.sectionTitle}>Everything You Need to Succeed</h2>
        
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎓</div>
            <h3>Expert Instructors</h3>
            <p>Learn from industry professionals with years of experience</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>AI-Powered Learning</h3>
            <p>Personalized learning path adapted to your pace and goals</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📱</div>
            <h3>Learn Anywhere</h3>
            <p>Access courses on any device, anytime, anywhere</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏆</div>
            <h3>Certificates</h3>
            <p>Earn recognized certificates upon course completion</p>
          </div>
        </div>
      </section>

      <section className={styles.testimonials}>
        <div className={styles.sectionBadge}>Student Success</div>
        <h2 className={styles.sectionTitle}>What Our Students Say</h2>
        
        <div className={styles.testimonialGrid}>
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className={styles.testimonialCard}>
              <div className={styles.testimonialAvatar}>{testimonial.avatar}</div>
              <div className={styles.testimonialRating}>
                {'⭐'.repeat(testimonial.rating)}
              </div>
              <p className={styles.testimonialContent}>"{testimonial.content}"</p>
              <div className={styles.testimonialAuthor}>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Start Learning?</h2>
          <p>Join millions of students and transform your career today!</p>
          <button 
            onClick={() => openAuthModal('register')} 
            className={styles.btnPrimary}
          >
            Get Started Free →
          </button>
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
