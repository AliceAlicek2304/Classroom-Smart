import api from './api'

export interface Chapter {
  id: number
  title: string
  chapterNumber: number
  description: string
  isActive: boolean
  pdfUrl?: string
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
  isActive?: boolean
  textbookId: number
  pdfFile?: File
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
    const formData = new FormData()
    const { pdfFile, ...chapterData } = data
    formData.append('chapter', new Blob([JSON.stringify(chapterData)], { type: 'application/json' }))
    if (pdfFile) formData.append('file', pdfFile)
    
    const response = await api.post('/chapters', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  update: async (id: number, data: ChapterRequest): Promise<ApiResponse<Chapter>> => {
    const formData = new FormData()
    const { pdfFile, ...chapterData } = data
    formData.append('chapter', new Blob([JSON.stringify(chapterData)], { type: 'application/json' }))
    if (pdfFile) formData.append('file', pdfFile)
    
    const response = await api.put(`/chapters/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/chapters/${id}`)
    return response.data
  }
}

export default chapterAPI
