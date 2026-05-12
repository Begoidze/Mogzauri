import type { FastifyReply, FastifyRequest } from "fastify"
import type { AuthUser, JwtUser } from "./auth"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtUser
    user: JwtUser
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    user: AuthUser
  }
}
