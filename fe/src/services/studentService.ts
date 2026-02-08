import api from './api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface StudentInClass {
  id: number
  studentId: number
  username: string
  fullName: string
  email: string
  enrolledAt: string
  isActive: boolean
}

export interface Student {
  id: number
  username: string
  fullName: string
  email: string
  birthDay: string | null
  isActive: boolean
}

export interface AddStudentRequest {
  studentId: number
}

const studentAPI = {
  getStudentsInClassroom: (classroomId: number) => 
    api.get<ApiResponse<StudentInClass[]>>(`/classrooms/${classroomId}/students`),
  
  getAllStudents: () => 
    api.get<ApiResponse<Student[]>>('/auth/students'),
  
  addStudent: (classroomId: number, studentId: number) => 
    api.post<ApiResponse<StudentInClass>>(`/classrooms/${classroomId}/students`, { studentId }),
  
  removeStudent: (classroomId: number, studentId: number) => 
    api.delete<ApiResponse<void>>(`/classrooms/${classroomId}/students/${studentId}`)
}

export default studentAPI
