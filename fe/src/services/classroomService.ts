import api from './api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Classroom {
  id: number
  name: string
  gradeLevel: string
  schoolYear: string
  description: string
  isActive: boolean
  teacherId: number
  teacherName: string
  subjectId: number
  subjectName: string
  studentCount: number
  meetUrl: string
  createdAt: string
  updatedAt: string
}

export interface ClassroomRequest {
  name: string
  gradeLevel: string
  schoolYear: string
  description: string
  subjectId: number
  password: string
}

export interface EnrollRequest {
  password: string
}

const classroomAPI = {
  getAll: () => api.get<ApiResponse<Classroom[]>>('/classrooms'),
  
  getMyClassrooms: () => api.get<ApiResponse<Classroom[]>>('/classrooms/my-classrooms'),
  
  getById: (id: number) => api.get<ApiResponse<Classroom>>(`/classrooms/${id}`),
  
  search: (keyword: string) => api.get<ApiResponse<Classroom[]>>(`/classrooms/search?keyword=${keyword}`),
  
  getBySubject: (subjectId: number) => api.get<ApiResponse<Classroom[]>>(`/classrooms/subject/${subjectId}`),
  
  create: (data: ClassroomRequest) => api.post<ApiResponse<Classroom>>('/classrooms', data),
  
  update: (id: number, data: ClassroomRequest) => api.put<ApiResponse<Classroom>>(`/classrooms/${id}`, data),
  
  delete: (id: number) => api.delete<ApiResponse<void>>(`/classrooms/${id}`),

  enroll: (classroomId: number, password: string) =>
    api.post<ApiResponse<unknown>>(`/classrooms/${classroomId}/enroll`, { password }),

  getEnrolled: () => api.get<ApiResponse<Classroom[]>>('/classrooms/enrolled'),
}

export default classroomAPI
