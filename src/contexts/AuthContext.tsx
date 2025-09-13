"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { validateBasicSession } from '@/lib/basic-auth'
import type { AuthUser } from '@/lib/basic-auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (sessionToken: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getSessionToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('eagle_session_token')
    }
    return null
  }

  const setSessionToken = (token: string | null) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('eagle_session_token', token)
      } else {
        localStorage.removeItem('eagle_session_token')
      }
    }
  }

  const validateCurrentSession = async () => {
    console.log('Validando sesión actual...')
    setIsLoading(true)
    try {
      const sessionToken = getSessionToken()
      console.log('Token encontrado:', sessionToken ? 'SÍ' : 'NO')

      if (!sessionToken) {
        console.log('No hay token, usuario null')
        setUser(null)
        return
      }

      const authUser = await validateBasicSession(sessionToken)
      if (authUser) {
        console.log('Usuario válido:', authUser.email, authUser.userType)
        setUser(authUser)
      } else {
        console.log('Sesión inválida, limpiando token')
        // Invalid session, clear it
        setSessionToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Error validación de sesión:', error)
      setSessionToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (sessionToken: string) => {
    console.log('Haciendo login con token:', sessionToken)
    setSessionToken(sessionToken)

    // Validar inmediatamente el token
    const authUser = await validateBasicSession(sessionToken)
    if (authUser) {
      console.log('Login exitoso, estableciendo usuario:', authUser.email)
      setUser(authUser)
    } else {
      console.log('Error: token inválido en login')
      setSessionToken(null)
      setUser(null)
    }
  }

  const handleLogout = async () => {
    // Para auth básico, solo limpiamos el token local
    setSessionToken(null)
    setUser(null)
    console.log('Sesión cerrada')
  }

  const refresh = async () => {
    await validateCurrentSession()
  }

  useEffect(() => {
    validateCurrentSession()
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    refresh
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}