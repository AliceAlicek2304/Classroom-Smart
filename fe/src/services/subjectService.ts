import api from './api'

export interface Subject {
  id: number
  name: string
  description: string
  grade: number
  isActive: boolean
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface SubjectRequest {
  name: string
  description: string
  grade: number
  isActive?: boolean
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: string
}

const subjectAPI = {
  getAll: async (): Promise<ApiResponse<Subject[]>> => {
    const response = await api.get('/subjects')
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Subject>> => {
    const response = await api.get(`/subjects/${id}`)
    return response.data
  },

  getActive: async (): Promise<ApiResponse<Subject[]>> => {
    const response = await api.get('/subjects/active')
    return response.data
  },

  search: async (keyword: string): Promise<ApiResponse<Subject[]>> => {
    const response = await api.get(`/subjects/search?keyword=${keyword}`)
    return response.data
  },

  create: async (data: SubjectRequest): Promise<ApiResponse<Subject>> => {
    const response = await api.post('/subjects', data)
    return response.data
  },

  update: async (id: number, data: SubjectRequest): Promise<ApiResponse<Subject>> => {
    const response = await api.put(`/subjects/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/subjects/${id}`)
    return response.data
  }
}

export default subjectAPI
