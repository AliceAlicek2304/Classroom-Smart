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

export interface ExamResponse {
  id: number
  title: string
  description: string
  dueDate: string | null
  duration: number
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

export interface ExamRequest {
  title: string
  description?: string
  dueDate?: string
  duration: number
  classroomIds: number[]
  questions: QuestionRequest[]
}

const examAPI = {
  getAll: () =>
    api.get<ApiResponse<ExamResponse[]>>('/exams'),

  getMy: () =>
    api.get<ApiResponse<ExamResponse[]>>('/exams/my'),

  getById: (id: number) =>
    api.get<ApiResponse<ExamResponse>>(`/exams/${id}`),

  getByClassroom: (classroomId: number) =>
    api.get<ApiResponse<ExamResponse[]>>(`/exams/classroom/${classroomId}`),

  create: (data: ExamRequest) =>
    api.post<ApiResponse<ExamResponse>>('/exams', data),

  update: (id: number, data: ExamRequest) =>
    api.put<ApiResponse<ExamResponse>>(`/exams/${id}`, data),

  toggleActive: (id: number) =>
    api.put<ApiResponse<ExamResponse>>(`/exams/${id}/toggle-active`, {}),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/exams/${id}`),
}

export default examAPI
