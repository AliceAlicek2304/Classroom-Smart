import api from './api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface GradeColumnResponse {
  id: number
  name: string
  type: string
  orderNumber: number
  isCustom: boolean
}

export interface GradeEntryResponse {
  gradeId: number | null
  columnId: number
  score: number | null
}

export interface StudentGradeRowResponse {
  studentId: number
  studentName: string
  username: string
  grades: GradeEntryResponse[]
}

export interface GradeBookResponse {
  classroomId: number
  classroomName: string
  columns: GradeColumnResponse[]
  rows: StudentGradeRowResponse[]
}

const gradeAPI = {
  getGradeBook: (classroomId: number) =>
    api.get<ApiResponse<GradeBookResponse>>(`/grades/classroom/${classroomId}`),

  getMyGradeBook: (classroomId: number) =>
    api.get<ApiResponse<GradeBookResponse>>(`/grades/classroom/${classroomId}/my`),

  addColumn: (classroomId: number, data: { name: string; type: string; examId?: number | null }) =>
    api.post<ApiResponse<GradeColumnResponse>>(`/grades/classroom/${classroomId}/columns`, data),

  deleteColumn: (columnId: number) =>
    api.delete<ApiResponse<void>>(`/grades/columns/${columnId}`),

  updateGrade: (gradeId: number, score: number | null) =>
    api.put<ApiResponse<GradeEntryResponse>>(`/grades/${gradeId}`, { score }),
}

export const GRADE_TYPE_LABELS: Record<string, string> = {
  QUIZ_15: '15 phút',
  TEST_45: '45 phút',
  MIDTERM: 'Giữa kỳ',
  FINAL: 'Cuối kỳ',
}

export const GRADE_TYPE_COLORS: Record<string, string> = {
  QUIZ_15: '#6BCB77',
  TEST_45: '#4D96FF',
  MIDTERM: '#FF6B6B',
  FINAL: '#FFD93D',
}

export default gradeAPI
