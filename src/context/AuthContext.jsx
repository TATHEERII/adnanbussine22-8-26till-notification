import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ user, children }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
