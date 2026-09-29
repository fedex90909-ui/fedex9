import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { PublicUser, UserAddress } from '../types/models'
import { ensureSeedData } from '../services/db'
import * as authService from '../services/authService'

interface AuthApi {
  user: PublicUser | null
  isAdmin: boolean
  /** True until the stored session has been checked once. */
  booting: boolean
  signIn: (email: string, password: string, remember: boolean) => Promise<PublicUser>
  signUp: (input: { name: string; email: string; phone: string; password: string }) => Promise<PublicUser>
  signOut: () => void
  updateProfile: (patch: {
    name: string
    email: string
    phone: string
    address: UserAddress
  }) => Promise<PublicUser>
  refresh: () => void
}

const AuthContext = createContext<AuthApi | null>(null)

export function useAuthContext(): AuthApi {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    ensureSeedData()
    authService.currentUser().then((u) => {
      setUser(u)
      setBooting(false)
    })
  }, [])

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    const u = await authService.signIn({ email, password, remember })
    setUser(u)
    return u
  }, [])

  const signUp = useCallback(
    async (input: { name: string; email: string; phone: string; password: string }) => {
      const u = await authService.signUp(input)
      setUser(u)
      return u
    },
    [],
  )

  const signOut = useCallback(() => {
    authService.signOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    async (patch: { name: string; email: string; phone: string; address: UserAddress }) => {
      if (!user) throw new Error('Not signed in')
      const u = await authService.updateProfile(user.id, patch)
      setUser(u)
      return u
    },
    [user],
  )

  const refresh = useCallback(() => {
    authService.currentUser().then((u) => setUser(u))
  }, [])

  const api = useMemo<AuthApi>(
    () => ({
      user,
      isAdmin: user?.role === 'admin',
      booting,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refresh,
    }),
    [user, booting, signIn, signUp, signOut, updateProfile, refresh],
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}
