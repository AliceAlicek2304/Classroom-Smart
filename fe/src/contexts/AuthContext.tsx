import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import authAPI from '../services/authService'

interface User {
  id: number
  username: string
  email: string
  fullName: string
  role: string
  birthDay?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, refreshToken: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const response = await authAPI.getCurrentUser()
          if (response.success) {
            setUser(response.data)
          } else {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (token: string, refreshToken: string) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refreshToken)
    
    try {
      const response = await authAPI.getCurrentUser()
      if (response.success) {
        setUser(response.data)
      }
    } catch {
      // silently ignore - token may be expired
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
