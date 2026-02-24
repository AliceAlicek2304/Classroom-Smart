import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { AuthProvider } from './contexts'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage/HomePage'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import SubjectsPage from './pages/Admin/SubjectsPage'
import TextbooksPage from './pages/Admin/TextbooksPage'
import ClassroomsPage from './pages/Admin/ClassroomsPage'
import StudentsPage from './pages/Admin/StudentsPage'
import TeacherDashboard from './pages/Teacher/TeacherDashboard'
import TeacherClassroomsPage from './pages/Teacher/TeacherClassroomsPage'
import TeacherAssignmentsPage from './pages/Teacher/TeacherAssignmentsPage'
import TeacherExamsPage from './pages/Teacher/TeacherExamsPage'
import CustomerClassroomsPage from './pages/Customer/CustomerClassroomsPage'
import DoAssignmentPage from './pages/Customer/DoAssignmentPage'
import ProfilePage from './pages/Common/ProfilePage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
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
            <Route path="/admin/classrooms" element={
              <ProtectedRoute requiredRole="ADMIN">
                <ClassroomsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute requiredRole="ADMIN">
                <StudentsPage />
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
            <Route path="/teacher/assignments" element={
              <ProtectedRoute requiredRole="TEACHER">
                <TeacherAssignmentsPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/exams" element={
              <ProtectedRoute requiredRole="TEACHER">
                <TeacherExamsPage />
              </ProtectedRoute>
            } />

            <Route path="/customer/my-classrooms" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerClassroomsPage />
              </ProtectedRoute>
            } />
            <Route path="/customer/classrooms" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerClassroomsPage />
              </ProtectedRoute>
            } />
            <Route path="/customer/docs" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerClassroomsPage />
              </ProtectedRoute>
            } />
            <Route path="/customer/assignments" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerClassroomsPage />
              </ProtectedRoute>
            } />

            <Route path="/customer/assignment/:id" element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <DoAssignmentPage />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
