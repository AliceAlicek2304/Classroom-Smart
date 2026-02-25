import axios from 'axios'

export const SERVER_URL = 'http://localhost:8080'
export const API_BASE_URL = `${SERVER_URL}/api`

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Queue for requests waiting while token is being refreshed
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const flushQueue = (token: string | null, error: unknown = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  pendingQueue = []
}

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Only intercept 401 that haven't been retried and are not the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh-token')
    ) {
      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (!storedRefreshToken) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Another refresh is already in flight — queue this request
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newToken) => {
              original.headers.Authorization = `Bearer ${newToken}`
              resolve(api(original))
            },
            reject,
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: storedRefreshToken,
        })
        const newToken: string = res.data?.data?.token
        if (!newToken) throw new Error('No token in refresh response')

        localStorage.setItem('accessToken', newToken)
        if (res.data?.data?.refreshToken) {
          localStorage.setItem('refreshToken', res.data.data.refreshToken)
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        flushQueue(newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        flushQueue(null, refreshError)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

