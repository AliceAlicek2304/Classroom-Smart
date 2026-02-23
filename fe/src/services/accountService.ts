import api from './api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Teacher {
  id: number
  username: string
  fullName: string
  email: string
  avatar?: string
  isActive: boolean
}

export interface Student {
  id: number
  username: string
  fullName: string
  email: string
  birthDay: string | null
  avatar?: string
  isActive: boolean
}

const accountAPI = {
  getTeachers: () =>
    api.get<ApiResponse<Teacher[]>>('/accounts/teachers'),

  getStudents: () =>
    api.get<ApiResponse<Student[]>>('/accounts/students'),

  toggleActive: (id: number) =>
    api.put<ApiResponse<Student>>(`/accounts/${id}/toggle-active`)
}

export default accountAPI
