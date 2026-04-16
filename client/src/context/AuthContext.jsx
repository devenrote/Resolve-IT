import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/authService'
import { setAuthToken } from '../services/http'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('resolveit_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      authApi
        .me()
        .then((res) => setUser(res.user))
        .catch(() => {
          localStorage.removeItem('resolveit_token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = (authToken, authUser) => {
    localStorage.setItem('resolveit_token', authToken)
    setAuthToken(authToken)
    setToken(authToken)
    setUser(authUser)
  }

  const logout = () => {
    localStorage.removeItem('resolveit_token')
    setAuthToken(null)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      setUser,
    }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
