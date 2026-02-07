import api from './api'

export interface Chapter {
  id: number
  title: string
  chapterNumber: number
  description: string
  pageStart: number
  pageEnd: number
  isActive: boolean
  textbookId: number
  textbookTitle?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface ChapterRequest {
  title: string
  chapterNumber: number
  description: string
  pageStart: number
  pageEnd: number
  isActive?: boolean
  textbookId: number
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: string
}

const chapterAPI = {
  getAll: async (): Promise<ApiResponse<Chapter[]>> => {
    const response = await api.get('/chapters')
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Chapter>> => {
    const response = await api.get(`/chapters/${id}`)
    return response.data
  },

  getByTextbook: async (textbookId: number): Promise<ApiResponse<Chapter[]>> => {
    const response = await api.get(`/chapters/textbook/${textbookId}`)
    return response.data
  },

  getActive: async (): Promise<ApiResponse<Chapter[]>> => {
    const response = await api.get('/chapters/active')
    return response.data
  },

  create: async (data: ChapterRequest): Promise<ApiResponse<Chapter>> => {
    const response = await api.post('/chapters', data)
    return response.data
  },

  update: async (id: number, data: ChapterRequest): Promise<ApiResponse<Chapter>> => {
    const response = await api.put(`/chapters/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/chapters/${id}`)
    return response.data
  }
}

export default chapterAPI
