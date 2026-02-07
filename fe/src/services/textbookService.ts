import api from './api'

export interface Textbook {
  id: number
  title: string
  description: string
  publisher: string
  publicationYear: number
  grade: number
  isActive: boolean
  subjectId: number
  subjectName?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface TextbookRequest {
  title: string
  description: string
  publisher: string
  publicationYear: number
  grade: number
  isActive?: boolean
  subjectId: number
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: string
}

const textbookAPI = {
  getAll: async (): Promise<ApiResponse<Textbook[]>> => {
    const response = await api.get('/textbooks')
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Textbook>> => {
    const response = await api.get(`/textbooks/${id}`)
    return response.data
  },

  getBySubject: async (subjectId: number): Promise<ApiResponse<Textbook[]>> => {
    const response = await api.get(`/textbooks/subject/${subjectId}`)
    return response.data
  },

  getActive: async (): Promise<ApiResponse<Textbook[]>> => {
    const response = await api.get('/textbooks/active')
    return response.data
  },

  search: async (keyword: string): Promise<ApiResponse<Textbook[]>> => {
    const response = await api.get(`/textbooks/search?keyword=${keyword}`)
    return response.data
  },

  create: async (data: TextbookRequest): Promise<ApiResponse<Textbook>> => {
    const response = await api.post('/textbooks', data)
    return response.data
  },

  update: async (id: number, data: TextbookRequest): Promise<ApiResponse<Textbook>> => {
    const response = await api.put(`/textbooks/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/textbooks/${id}`)
    return response.data
  }
}

export default textbookAPI
