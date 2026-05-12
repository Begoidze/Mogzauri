import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { parseInput, sendError, validationMessage } from "../lib/http"

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Email must be valid").toLowerCase(),
  phone: z.string().trim().min(5, "Phone is invalid").optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
})

const contactRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/contact",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 hour",
        },
      },
    },
    async (request, reply) => {
      try {
        const body = parseInput(contactSchema, request.body)
        await prisma.contactMessage.create({ data: body })

        return reply.status(201).send({ ok: true })
      } catch (error) {
        request.log.debug({ err: error }, "Contact form failed")
        return sendError(reply, 400, validationMessage(error))
      }
    },
  )
}

export default contactRoutes
