# Classroom Smart

Hệ thống quản lý học tập thông minh cho trường THCS Việt Nam (khối 6–9). Giáo viên soạn bài tập và đề kiểm tra theo sách giáo khoa, AI hỗ trợ sinh câu hỏi trắc nghiệm (MCQ), học sinh tham gia lớp và làm bài trực tuyến.

## ✨ Tính năng

### 👨‍💼 Admin
- Quản lý môn học, sách giáo khoa, chương theo khối 6–9
- Quản lý tài khoản giáo viên và học sinh (kích hoạt / khóa)
- Dashboard thống kê realtime

### 👩‍🏫 Giáo viên
- Tạo và quản lý lớp học, thêm / xóa học sinh
- Soạn bài tập và đề kiểm tra với câu hỏi trắc nghiệm MCQ
- **AI Panel**: sinh câu hỏi từ text prompt hoặc upload file PDF (Google Gemini)
- Đề kiểm tra theo loại: 15 phút, 45 phút, Giữa kỳ, Cuối kỳ
- Xem danh sách bài nộp và điểm số của học sinh
- **Bảng điểm**: spreadsheet click-to-edit, thêm/xóa cột, tự fill điểm từ bài kiểm tra

### 🧑‍🎓 Học sinh
- Tham gia lớp học (enroll)
- Xem tài liệu sách giáo khoa theo môn / khối / NXB
- Xem và làm bài tập, bài kiểm tra được giao
- Kiểm tra có countdown timer và chống gian lận tab-switch
- Xem bảng điểm cá nhân theo lớp

## 🛠️ Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Backend | Spring Boot 4.0.2, Java 21 |
| Database | MySQL 8 |
| Security | Spring Security + JWT (JJWT 0.12.3) |
| AI | Google Gemini API + Apache PDFBox |
| Email | Gmail SMTP (Async) |
| Frontend | React 18 + TypeScript + Vite |
| HTTP Client | Axios |
| Routing | React Router DOM v6 |
| CSS | CSS Modules (Neobrutalism design) |

## 📦 Cài đặt

### Yêu cầu
- Java 21+
- Node.js 18+
- MySQL 8+

### 1. Cấu hình Backend

Tạo file `be/src/main/resources/application.properties`:

```properties
spring.application.name=education

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/educationai
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=your_jwt_secret_key_here_min_32_chars
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# Email (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Google Gemini AI
gemini.api.key=your_gemini_api_key

# Server
server.port=8080
app.url=http://localhost:3000
```

### 2. Chạy Backend

```bash
cd be
mvnw spring-boot:run
```

Server khởi động tại `http://localhost:8080`. Database tables tự tạo qua `ddl-auto=update`.

### 3. Chạy Frontend

```bash
cd fe
npm install
npm run dev
```

Ứng dụng chạy tại `http://localhost:3000`.

## 🔑 Tài khoản mặc định

Khi backend khởi động lần đầu, hệ thống tự tạo 3 tài khoản:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Giáo viên | `teacher` | `teacher123` |
| Học sinh | `customer` | `customer123` |

## 📡 API

Backend cung cấp ~65 REST endpoints:

| Controller | Prefix | Endpoints |
|---|---|---|
| Auth | `/api/auth` | Đăng ký, đăng nhập, xác thực email, reset mật khẩu, avatar |
| Account | `/api/accounts` | Quản lý tài khoản (Admin) |
| Subject | `/api/subjects` | Môn học |
| Textbook | `/api/textbooks` | Sách giáo khoa |
| Chapter | `/api/chapters` | Chương sách |
| Classroom | `/api/classrooms` | Lớp học + enroll |
| Assignment | `/api/assignments` | Bài tập + nộp bài |
| Exam | `/api/exams` | Đề kiểm tra + nộp bài |
| AI | `/api/ai` | Sinh câu hỏi MCQ |
| Dashboard | `/api/dashboard` | Thống kê Admin |
| Grade | `/api/grades` | Bảng điểm + cập nhật điểm |

Chi tiết xem [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md).

## 📁 Cấu trúc dự án

```
education_AI/
├── be/                     # Spring Boot backend
│   └── src/main/java/com/alice/education/
│       ├── config/         # Security, CORS, Async
│       ├── controller/     # REST controllers
│       ├── dto/            # Request / Response DTOs
│       ├── model/          # JPA Entities
│       ├── repository/     # Spring Data JPA
│       ├── security/       # JWT utils & filters
│       └── service/        # Business logic
└── fe/                     # React frontend
    └── src/
        ├── components/     # Header, Footer, Layouts, Modals, Toast
        ├── contexts/       # AuthContext
        ├── hooks/          # useConfirm
        ├── pages/          # Admin, Teacher, Customer, Auth, Common
        └── services/       # API service files
```

## 📝 License

MIT License
