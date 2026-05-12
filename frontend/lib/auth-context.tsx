"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api"

export interface CurrentUser {
  id: string
  email: string
  name: string
  phone: string
  address: string | null
  role: "CUSTOMER" | "ADMIN"
  createdAt: string
  updatedAt: string
}

export interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
  address?: string
  captchaToken?: string
}

export type ProfileInput = Partial<
  Pick<CurrentUser, "name" | "phone" | "address">
>

interface AuthContextValue {
  user: CurrentUser | null
  isLoading: boolean
  login: (email: string, password: string, captchaToken?: string) => Promise<CurrentUser>
  register: (data: RegisterInput) => Promise<CurrentUser>
  logout: () => Promise<void>
  updateProfile: (data: ProfileInput) => Promise<CurrentUser>
  refreshUser: () => Promise<CurrentUser | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? "Request failed")
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const payload = await apiRequest<{ user: CurrentUser }>("/auth/me")
      setUser(payload.user)
      return payload.user
    } catch {
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string, captchaToken?: string) => {
    const payload = await apiRequest<{ user: CurrentUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, captchaToken }),
    })
    setUser(payload.user)
    return payload.user
  }, [])

  const registerUser = useCallback(async (data: RegisterInput) => {
    const payload = await apiRequest<{ user: CurrentUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
    setUser(payload.user)
    return payload.user
  }, [])

  const logout = useCallback(async () => {
    await apiRequest<void>("/auth/logout", { method: "POST" })
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data: ProfileInput) => {
    const payload = await apiRequest<{ user: CurrentUser }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    setUser(payload.user)
    return payload.user
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register: registerUser,
      logout,
      updateProfile,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, registerUser, updateProfile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

export { API_URL }
