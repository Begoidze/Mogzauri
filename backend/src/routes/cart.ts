import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { parseInput, sendError, validationMessage } from "../lib/http"

const cartItemSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(99, "Quantity is too high"),
})

const cartParamsSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
})

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative").max(99, "Quantity is too high"),
})

function cartInclude() {
  return {
    product: true,
  } as const
}

const cartRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate)

  app.get("/cart", async (request) => {
    const items = await prisma.cartItem.findMany({
      where: { userId: request.user.id },
      include: cartInclude(),
      orderBy: { createdAt: "desc" },
    })

    return { items }
  })

  app.post("/cart", async (request, reply) => {
    try {
      const body = parseInput(cartItemSchema, request.body)
      const product = await prisma.product.findFirst({
        where: { id: body.productId, active: true },
        select: { id: true, stock: true },
      })

      if (!product) {
        return sendError(reply, 404, "Product not found")
      }

      const existingItem = await prisma.cartItem.findUnique({
        where: { userId_productId: { userId: request.user.id, productId: body.productId } },
        select: { quantity: true },
      })

      const nextQuantity = (existingItem?.quantity ?? 0) + body.quantity
      if (nextQuantity > product.stock) {
        return sendError(reply, 409, "Requested quantity exceeds available stock")
      }

      const item = await prisma.cartItem.upsert({
        where: { userId_productId: { userId: request.user.id, productId: body.productId } },
        update: { quantity: { increment: body.quantity } },
        create: {
          userId: request.user.id,
          productId: body.productId,
          quantity: body.quantity,
        },
        include: cartInclude(),
      })

      return reply.status(201).send({ item })
    } catch (error) {
      request.log.debug({ err: error }, "Add cart item failed")
      return sendError(reply, 400, validationMessage(error))
    }
  })

  app.patch("/cart/:productId", async (request, reply) => {
    try {
      const { productId } = parseInput(cartParamsSchema, request.params)
      const body = parseInput(updateCartItemSchema, request.body)

      if (body.quantity === 0) {
        await prisma.cartItem.deleteMany({
          where: { userId: request.user.id, productId },
        })
        return reply.status(204).send()
      }

      const product = await prisma.product.findFirst({
        where: { id: productId, active: true },
        select: { stock: true },
      })

      if (!product) {
        return sendError(reply, 404, "Product not found")
      }

      if (body.quantity > product.stock) {
        return sendError(reply, 409, "Requested quantity exceeds available stock")
      }

      const updated = await prisma.cartItem.updateMany({
        where: { userId: request.user.id, productId },
        data: { quantity: body.quantity },
      })

      if (updated.count === 0) {
        return sendError(reply, 404, "Cart item not found")
      }

      const item = await prisma.cartItem.findUniqueOrThrow({
        where: { userId_productId: { userId: request.user.id, productId } },
        include: cartInclude(),
      })

      return { item }
    } catch (error) {
      request.log.debug({ err: error }, "Update cart item failed")
      return sendError(reply, 400, validationMessage(error))
    }
  })

  app.delete("/cart/:productId", async (request, reply) => {
    try {
      const { productId } = parseInput(cartParamsSchema, request.params)
      await prisma.cartItem.deleteMany({
        where: { userId: request.user.id, productId },
      })

      return reply.status(204).send()
    } catch (error) {
      return sendError(reply, 400, validationMessage(error))
    }
  })

  app.delete("/cart", async (request, reply) => {
    await prisma.cartItem.deleteMany({
      where: { userId: request.user.id },
    })

    return reply.status(204).send()
  })
}

export default cartRoutes
