import api from './api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface GeneratedQuestion {
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  orderNumber?: number
}

export interface AIGenerateRequest {
  prompt: string
  numQuestions: number
}

export interface RateLimitStatus {
  minuteUsed: number
  minuteLimit: number
  minuteRemaining: number
  dayUsed: number
  dayLimit: number
  dayRemaining: number
}

const aiAPI = {
  generateFromText: (data: AIGenerateRequest) =>
    api.post<ApiResponse<GeneratedQuestion[]>>('/ai/generate-questions', data),

  generateFromFile: (file: File, prompt: string, numQuestions: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('prompt', prompt)
    formData.append('numQuestions', String(numQuestions))
    return api.post<ApiResponse<GeneratedQuestion[]>>('/ai/generate-questions-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getRateLimitStatus: () =>
    api.get<ApiResponse<RateLimitStatus>>('/ai/rate-limit-status'),
}

export default aiAPI
