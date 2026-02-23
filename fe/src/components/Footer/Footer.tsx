import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerBrand}>
          <h3>🎓 Classroom Smart</h3>
          <p>Empowering learners worldwide with AI-powered education platform</p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="LinkedIn">💼</a>
            <a href="#" aria-label="Instagram">📷</a>
          </div>
        </div>
        <div className={styles.footerLinks}>
          <div>
            <h4>Platform</h4>
            <a href="#">Courses</a>
            <a href="#">Teachers</a>
            <a href="#">Pricing</a>
            <a href="#">Become Instructor</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
            <a href="#">Press Kit</a>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="#">Blog</a>
            <a href="#">Help Center</a>
            <a href="#">Community</a>
            <a href="#">Support</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2026 Classroom Smart. All rights reserved. Built with ❤️ for learners worldwide.</p>
      </div>
    </footer>
  )
}

export default Footer
