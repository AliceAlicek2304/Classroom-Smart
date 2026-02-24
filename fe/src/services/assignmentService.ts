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
  hasSubmitted?: boolean | null
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

export interface SubmitAnswerRequest {
  questionId: number
  selectedAnswer: string | null
}

export interface SubmitAssignmentRequest {
  answers: SubmitAnswerRequest[]
}

export interface SubmissionAnswerResult {
  questionId: number
  questionContent: string
  selectedAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
}

export interface SubmissionResponse {
  id: number
  assignmentId: number
  assignmentTitle: string
  studentId: number
  studentName: string
  correctCount: number
  totalCount: number
  score: number
  submittedAt: string
  answers: SubmissionAnswerResult[]
  createdAt: string
  classroomName?: string
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

  submit: (id: number, data: SubmitAssignmentRequest) =>
    api.post<ApiResponse<SubmissionResponse>>(`/assignments/${id}/submit`, data),

  getMySubmissions: (id: number) =>
    api.get<ApiResponse<SubmissionResponse[]>>(`/assignments/${id}/my-submissions`),

  getAllSubmissions: (id: number) =>
    api.get<ApiResponse<SubmissionResponse[]>>(`/assignments/${id}/submissions`),
}

export default assignmentAPI
