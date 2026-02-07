import api from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  message: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: string
}

// Auth API endpoints
export const authAPI = {
  // Login
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  // Register
  register: async (data: RegisterRequest): Promise<ApiResponse<{ message: string; success: boolean }>> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse<{ message: string; success: boolean }>> => {
    const response = await api.get(`/auth/verify?token=${token}`)
    return response.data
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<ApiResponse<{ message: string; success: boolean }>> => {
    const response = await api.post('/auth/resend-verification', { email })
    return response.data
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string; success: boolean }>> => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<{ message: string; success: boolean }>> => {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string; success: boolean }>> => {
    const response = await api.put('/auth/change-password', { oldPassword, newPassword })
    return response.data
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/refresh-token', { refreshToken })
    return response.data
  }
}

export default authAPI
