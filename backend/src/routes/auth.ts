import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import bcrypt from "bcrypt"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { parseInput, sendError, validationMessage } from "../lib/http"
import { userSelect } from "../plugins/auth"
import {
  clearRateLimit,
  incrementRateLimit,
  normalizeEmail,
  rateLimitKey,
  readRateLimit,
  secondsUntil,
  verifyCaptcha,
} from "../lib/auth-security"
import type { UserRole } from "../types/auth"

const authCookieName = "mogzauri_token"
const passwordCost = 12
const authWindowMs = 15 * 60 * 1000
const loginIpMax = 10
const loginEmailMax = 5
const registerIpMax = 5
const registerEmailMax = 2
const captchaAfterFailures = 3
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "2h"
const jwtCookieMaxAge = Number(process.env.JWT_COOKIE_MAX_AGE_SECONDS) || 60 * 60 * 2

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
)

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Email must be valid").toLowerCase(),
  phone: z.string().trim().min(5, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: optionalText,
  captchaToken: z.string().min(1).optional(),
})

const loginSchema = z.object({
  email: z.string().trim().email("Email must be valid").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  captchaToken: z.string().min(1).optional(),
})

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().trim().min(5, "Phone is required").optional(),
  address: z.string().trim().min(1, "Address cannot be empty").nullable().optional(),
})

function setAuthCookie(reply: FastifyReply, token: string) {
  reply.setCookie(authCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: jwtCookieMaxAge,
  })
}

function sessionExpiresAt() {
  return new Date(Date.now() + jwtCookieMaxAge * 1000)
}

async function createAuthSession(request: FastifyRequest, userId: string) {
  return prisma.authSession.create({
    data: {
      userId,
      expiresAt: sessionExpiresAt(),
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    },
    select: { id: true },
  })
}

function signAuthToken(
  app: FastifyInstance,
  user: { id: string; email: string; role: UserRole },
  sessionId: string,
) {
  return app.jwt.sign(
    { id: user.id, email: user.email, role: user.role, sessionId },
    { expiresIn: jwtExpiresIn },
  )
}

async function enforceAuthRateLimit(
  request: FastifyRequest,
  reply: FastifyReply,
  action: "login" | "register",
  email: string,
  captchaToken: string | undefined,
) {
  const normalizedEmail = normalizeEmail(email)
  const ipKey = rateLimitKey(`auth:${action}:ip`, request.ip)
  const emailKey = rateLimitKey(`auth:${action}:email`, normalizedEmail)
  const failureIpKey = rateLimitKey(`auth:${action}:failure-ip`, request.ip)
  const failureEmailKey = rateLimitKey(`auth:${action}:failure-email`, normalizedEmail)
  const ipBucket = incrementRateLimit(ipKey, authWindowMs)
  const emailBucket = incrementRateLimit(emailKey, authWindowMs)
  const ipMax = action === "login" ? loginIpMax : registerIpMax
  const emailMax = action === "login" ? loginEmailMax : registerEmailMax

  if (ipBucket.count > ipMax || emailBucket.count > emailMax) {
    const retryAt = Math.max(ipBucket.resetAt, emailBucket.resetAt)
    reply.header("Retry-After", secondsUntil(retryAt))
    return sendError(reply, 429, "Too many authentication attempts. Please try again later.")
  }

  const failureCount = Math.max(readRateLimit(failureIpKey).count, readRateLimit(failureEmailKey).count)
  if (failureCount >= captchaAfterFailures) {
    const captchaPassed = await verifyCaptcha(request, captchaToken)
    if (!captchaPassed) {
      return sendError(reply, 403, "Additional verification is required")
    }
  }

  return undefined
}

function recordAuthFailure(action: "login" | "register", email: string, ip: string) {
  const normalizedEmail = normalizeEmail(email)
  incrementRateLimit(rateLimitKey(`auth:${action}:failure-ip`, ip), authWindowMs)
  incrementRateLimit(rateLimitKey(`auth:${action}:failure-email`, normalizedEmail), authWindowMs)
}

function clearAuthFailures(action: "login" | "register", email: string, ip: string) {
  const normalizedEmail = normalizeEmail(email)
  clearRateLimit(rateLimitKey(`auth:${action}:failure-ip`, ip))
  clearRateLimit(rateLimitKey(`auth:${action}:failure-email`, normalizedEmail))
}

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (request, reply) => {
    try {
      const body = parseInput(registerSchema, request.body)
      const rateLimitResponse = await enforceAuthRateLimit(request, reply, "register", body.email, body.captchaToken)
      if (rateLimitResponse) return rateLimitResponse

      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true },
      })

      if (existingUser) {
        recordAuthFailure("register", body.email, request.ip)
        return sendError(reply, 409, "An account with this email already exists")
      }

      const passwordHash = await bcrypt.hash(body.password, passwordCost)
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: passwordHash,
          name: body.name,
          phone: body.phone,
          address: body.address,
        },
        select: userSelect,
      })

      clearAuthFailures("register", body.email, request.ip)
      const session = await createAuthSession(request, user.id)
      const token = signAuthToken(app, user, session.id)
      setAuthCookie(reply, token)

      return reply.status(201).send({ user })
    } catch (error) {
      request.log.debug({ err: error }, "Register failed")
      return sendError(reply, 400, validationMessage(error))
    }
  })

  app.post("/auth/login", async (request, reply) => {
    try {
      const body = parseInput(loginSchema, request.body)
      const rateLimitResponse = await enforceAuthRateLimit(request, reply, "login", body.email, body.captchaToken)
      if (rateLimitResponse) return rateLimitResponse

      const userWithPassword = await prisma.user.findUnique({
        where: { email: body.email },
        select: { ...userSelect, password: true },
      })

      if (!userWithPassword) {
        recordAuthFailure("login", body.email, request.ip)
        return sendError(reply, 401, "Invalid email or password")
      }

      const passwordMatches = await bcrypt.compare(body.password, userWithPassword.password)
      if (!passwordMatches) {
        recordAuthFailure("login", body.email, request.ip)
        return sendError(reply, 401, "Invalid email or password")
      }

      const { password: _pwd, ...user } = userWithPassword
      clearAuthFailures("login", body.email, request.ip)
      const session = await createAuthSession(request, user.id)
      const token = signAuthToken(app, user, session.id)
      setAuthCookie(reply, token)

      return reply.send({ user })
    } catch (error) {
      request.log.debug({ err: error }, "Login failed")
      return sendError(reply, 400, validationMessage(error))
    }
  })

  app.post("/auth/logout", async (request, reply) => {
    try {
      await request.jwtVerify()
      const tokenPayload = request.user as { sessionId?: string }
      if (tokenPayload.sessionId) {
        await prisma.authSession.updateMany({
          where: { id: tokenPayload.sessionId },
          data: { revokedAt: new Date() },
        })
      }
    } catch (error) {
      request.log.debug({ err: error }, "Logout without a valid session")
    }

    reply.clearCookie(authCookieName, { path: "/" })
    return reply.status(204).send()
  })

  app.get("/auth/me", { preHandler: app.authenticate }, async (request) => {
    return { user: request.user }
  })

  app.patch("/auth/me", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const body = parseInput(updateProfileSchema, request.body)
      const user = await prisma.user.update({
        where: { id: request.user.id },
        data: body,
        select: userSelect,
      })

      return { user }
    } catch (error) {
      request.log.debug({ err: error }, "Profile update failed")
      return sendError(reply, 400, validationMessage(error))
    }
  })
}

export default authRoutes
