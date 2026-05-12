import type { FastifyReply } from "fastify"
import { ZodError, type ZodType } from "zod"

export function sendError(reply: FastifyReply, statusCode: number, error: string) {
  return reply.status(statusCode).send({ error })
}

export function parseInput<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)

  if (!result.success) {
    throw result.error
  }

  return result.data
}

export function validationMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Invalid request payload"
  }

  return "Invalid request payload"
}
