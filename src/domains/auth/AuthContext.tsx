import { createContext, useContext, type ReactNode } from 'react'
import type { AuthUser } from './auth'

type AuthContextValue = {
  user: AuthUser
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ user, onLogout, children }: { user: AuthUser; onLogout: () => void; children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user, logout: onLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
