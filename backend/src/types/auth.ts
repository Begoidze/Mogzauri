export type UserRole = "CUSTOMER" | "ADMIN"

export interface AuthUser {
  id: string
  email: string
  name: string
  phone: string
  address: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface JwtUser {
  id: string
  email: string
  role: UserRole
  sessionId: string
}
