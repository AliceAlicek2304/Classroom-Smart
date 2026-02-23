import api from './api'

export interface RecentActivity {
  type: 'SUBJECT' | 'TEXTBOOK' | 'CLASSROOM' | 'STUDENT'
  title: string
  description: string
  time: string
}

export interface DashboardStats {
  totalSubjects: number
  totalTextbooks: number
  activeClassrooms: number
  totalStudents: number
  recentActivities: RecentActivity[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const dashboardAPI = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats')
}

export default dashboardAPI
