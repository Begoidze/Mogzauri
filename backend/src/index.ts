import "dotenv/config"
import Fastify from "fastify"
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"
import cookie from "@fastify/cookie"
import helmet from "@fastify/helmet"
import rateLimit from "@fastify/rate-limit"
import authPlugin from "./plugins/auth"
import authRoutes from "./routes/auth"
import productsRoutes from "./routes/products"
import cartRoutes from "./routes/cart"
import ordersRoutes from "./routes/orders"
import contactRoutes from "./routes/contact"

const app = Fastify({ logger: true })

app.register(helmet)

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
})

app.register(cookie)

app.register(jwt, {
  secret: process.env.JWT_SECRET!,
  cookie: {
    cookieName: "mogzauri_token",
    signed: false,
  },
})

app.register(rateLimit, {
  max: 300,
  timeWindow: "1 hour",
})

app.register(authPlugin)

app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error }, "Unhandled request error")
  const statusCode = typeof error === "object" && error && "statusCode" in error
    ? Number(error.statusCode)
    : 500
  const message = typeof error === "object" && error && "message" in error
    ? String(error.message)
    : "Internal server error"

  const finalStatusCode = Number.isInteger(statusCode) ? statusCode : 500

  reply.status(finalStatusCode).send({
    error: finalStatusCode < 500 ? message : "Internal server error",
  })
})

app.get("/health", async () => ({ status: "ok" }))

app.register(authRoutes, { prefix: "/api" })
app.register(productsRoutes, { prefix: "/api" })
app.register(cartRoutes, { prefix: "/api" })
app.register(ordersRoutes, { prefix: "/api" })
app.register(contactRoutes, { prefix: "/api" })

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await app.listen({ port, host: "0.0.0.0" })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
