import type { FastifyPluginAsync, FastifyReply } from "fastify"
import bcrypt from "bcrypt"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { parseInput, sendError, validationMessage } from "../lib/http"
import { userSelect } from "../plugins/auth"

const authCookieName = "mogzauri_token"
const passwordCost = 12

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
  city: optionalText,
  country: optionalText,
  postalCode: optionalText,
})

const loginSchema = z.object({
  email: z.string().trim().email("Email must be valid").toLowerCase(),
  password: z.string().min(1, "Password is required"),
})

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().trim().min(5, "Phone is required").optional(),
  address: z.string().trim().min(1, "Address cannot be empty").nullable().optional(),
  city: z.string().trim().min(1, "City cannot be empty").nullable().optional(),
  country: z.string().trim().min(1, "Country cannot be empty").nullable().optional(),
  postalCode: z.string().trim().min(1, "Postal code cannot be empty").nullable().optional(),
})

function setAuthCookie(reply: FastifyReply, token: string) {
  reply.setCookie(authCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (request, reply) => {
    try {
      const body = parseInput(registerSchema, request.body)
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true },
      })

      if (existingUser) {
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
          city: body.city,
          country: body.country,
          postalCode: body.postalCode,
        },
        select: userSelect,
      })

      const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role })
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
      const userWithPassword = await prisma.user.findUnique({
        where: { email: body.email },
      })

      if (!userWithPassword) {
        return sendError(reply, 401, "Invalid email or password")
      }

      const passwordMatches = await bcrypt.compare(body.password, userWithPassword.password)
      if (!passwordMatches) {
        return sendError(reply, 401, "Invalid email or password")
      }

      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userWithPassword.id },
        select: userSelect,
      })
      const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role })
      setAuthCookie(reply, token)

      return reply.send({ user })
    } catch (error) {
      request.log.debug({ err: error }, "Login failed")
      return sendError(reply, 400, validationMessage(error))
    }
  })

  app.post("/auth/logout", async (_request, reply) => {
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
