import api from './api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface QuestionResponse {
  id: number
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  orderNumber: number
}

export interface AssignmentResponse {
  id: number
  title: string
  description: string
  dueDate: string | null
  isActive: boolean
  teacherId: number
  teacherName: string
  classroomIds: number[]
  classroomNames: string[]
  questions: QuestionResponse[]
  totalQuestions: number
  createdAt: string
  updatedAt: string
}

export interface QuestionRequest {
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  orderNumber?: number
}

export interface AssignmentRequest {
  title: string
  description?: string
  dueDate?: string
  classroomIds: number[]
  questions: QuestionRequest[]
}

const assignmentAPI = {
  getAll: () =>
    api.get<ApiResponse<AssignmentResponse[]>>('/assignments'),

  getMy: () =>
    api.get<ApiResponse<AssignmentResponse[]>>('/assignments/my'),

  getById: (id: number) =>
    api.get<ApiResponse<AssignmentResponse>>(`/assignments/${id}`),

  getByClassroom: (classroomId: number) =>
    api.get<ApiResponse<AssignmentResponse[]>>(`/assignments/classroom/${classroomId}`),

  create: (data: AssignmentRequest) =>
    api.post<ApiResponse<AssignmentResponse>>('/assignments', data),

  update: (id: number, data: AssignmentRequest) =>
    api.put<ApiResponse<AssignmentResponse>>(`/assignments/${id}`, data),

  toggleActive: (id: number) =>
    api.put<ApiResponse<AssignmentResponse>>(`/assignments/${id}/toggle-active`, {}),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/assignments/${id}`),
}

export default assignmentAPI
