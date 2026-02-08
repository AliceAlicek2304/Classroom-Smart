import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { AuthProvider } from './contexts'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import SubjectsPage from './pages/Admin/SubjectsPage'
import TextbooksPage from './pages/Admin/TextbooksPage'
import ChaptersPage from './pages/Admin/ChaptersPage'
import TeacherDashboard from './pages/Teacher/TeacherDashboard'
import TeacherClassroomsPage from './pages/Teacher/TeacherClassroomsPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/subjects" element={
              <ProtectedRoute requiredRole="ADMIN">
                <SubjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/textbooks" element={
              <ProtectedRoute requiredRole="ADMIN">
                <TextbooksPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/chapters" element={
              <ProtectedRoute requiredRole="ADMIN">
                <ChaptersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/classrooms" element={
              <ProtectedRoute requiredRole="ADMIN">
                <div>Classrooms Management - Coming Soon</div>
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute requiredRole="ADMIN">
                <div>Students Management - Coming Soon</div>
              </ProtectedRoute>
            } />
            
            <Route path="/teacher" element={
              <ProtectedRoute requiredRole="TEACHER">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/classrooms" element={
              <ProtectedRoute requiredRole="TEACHER">
                <TeacherClassroomsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
