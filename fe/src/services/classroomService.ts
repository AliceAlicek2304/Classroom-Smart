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
  createdAt: string
  updatedAt: string
}

export interface ClassroomRequest {
  name: string
  gradeLevel: string
  schoolYear: string
  description: string
  subjectId: number
}

const classroomAPI = {
  getAll: () => api.get<ApiResponse<Classroom[]>>('/classrooms'),
  
  getMyClassrooms: () => api.get<ApiResponse<Classroom[]>>('/classrooms/my-classrooms'),
  
  getById: (id: number) => api.get<ApiResponse<Classroom>>(`/classrooms/${id}`),
  
  search: (keyword: string) => api.get<ApiResponse<Classroom[]>>(`/classrooms/search?keyword=${keyword}`),
  
  getBySubject: (subjectId: number) => api.get<ApiResponse<Classroom[]>>(`/classrooms/subject/${subjectId}`),
  
  create: (data: ClassroomRequest) => api.post<ApiResponse<Classroom>>('/classrooms', data),
  
  update: (id: number, data: ClassroomRequest) => api.put<ApiResponse<Classroom>>(`/classrooms/${id}`, data),
  
  delete: (id: number) => api.delete<ApiResponse<void>>(`/classrooms/${id}`)
}

export default classroomAPI
