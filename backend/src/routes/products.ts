import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { parseInput, sendError, validationMessage } from "../lib/http"

const productParamsSchema = z.object({
  id: z.string().min(1, "Product id is required"),
})

const productsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/products", async () => {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    })

    return { products }
  })

  app.get("/products/:id", async (request, reply) => {
    try {
      const { id } = parseInput(productParamsSchema, request.params)
      const product = await prisma.product.findFirst({
        where: { id, active: true },
      })

      if (!product) {
        return sendError(reply, 404, "Product not found")
      }

      return { product }
    } catch (error) {
      return sendError(reply, 400, validationMessage(error))
    }
  })
}

export default productsRoutes
