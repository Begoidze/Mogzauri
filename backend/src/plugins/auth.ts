import fp from "fastify-plugin"
import type { FastifyPluginAsync } from "fastify"
import { prisma } from "../lib/prisma"
import { sendError } from "../lib/http"
import type { JwtUser } from "../types/auth"

const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  address: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify()
      const tokenPayload = request.user as JwtUser
      const session = await prisma.authSession.findFirst({
        where: {
          id: tokenPayload.sessionId,
          userId: tokenPayload.id,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      })

      if (!session) {
        return sendError(reply, 401, "Authentication required")
      }

      const user = await prisma.user.findUnique({
        where: { id: tokenPayload.id },
        select: userSelect,
      })

      if (!user) {
        return sendError(reply, 401, "Authentication required")
      }

      request.user = user
    } catch (error) {
      request.log.debug({ err: error }, "JWT verification failed")
      return sendError(reply, 401, "Authentication required")
    }
  })
}

export default fp(authPlugin)
export { userSelect }
