import type { FastifyPluginAsync } from "fastify"
import Stripe from "stripe"
import { ZodError, z } from "zod"
import { prisma } from "../lib/prisma"
import { parseInput, sendError, validationMessage } from "../lib/http"

const orderParamsSchema = z.object({
  id: z.string().min(1, "Order id is required"),
})

const createOrderSchema = z.object({
  shippingName: z.string().trim().min(2, "Shipping name is required"),
  shippingPhone: z.string().trim().min(5, "Shipping phone is required"),
  shippingAddress: z.string().trim().min(3, "Shipping address is required"),
})

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return null
  }

  return new Stripe(stripeSecretKey)
}

const orderInclude = {
  items: {
    include: {
      product: true,
    },
  },
} as const

const orderRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate)

  app.post("/orders", async (request, reply) => {
    try {
      const stripe = getStripeClient()
      if (!stripe) {
        return sendError(reply, 503, "Payment processing is not configured")
      }

      const body = parseInput(createOrderSchema, request.body)
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: request.user.id },
        include: { product: true },
        orderBy: { createdAt: "asc" },
      })

      if (cartItems.length === 0) {
        return sendError(reply, 400, "Cart is empty")
      }

      const inactiveItem = cartItems.find((item) => !item.product.active)
      if (inactiveItem) {
        return sendError(reply, 409, `${inactiveItem.product.name} is no longer available`)
      }

      const outOfStockItem = cartItems.find((item) => item.quantity > item.product.stock)
      if (outOfStockItem) {
        return sendError(reply, 409, `${outOfStockItem.product.name} does not have enough stock`)
      }

      const total = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

      const order = await prisma.$transaction(async (tx) => {
        for (const item of cartItems) {
          const stockUpdate = await tx.product.updateMany({
            where: {
              id: item.productId,
              active: true,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          })

          if (stockUpdate.count !== 1) {
            throw new Error(`${item.product.name} does not have enough stock`)
          }
        }

        const createdOrder = await tx.order.create({
          data: {
            userId: request.user.id,
            total,
            shippingName: body.shippingName,
            shippingPhone: body.shippingPhone,
            shippingAddress: body.shippingAddress,
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
          include: orderInclude,
        })

        await tx.cartItem.deleteMany({
          where: { userId: request.user.id },
        })

        return createdOrder
      })

      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.total,
        currency: process.env.STRIPE_CURRENCY ?? "gel",
        metadata: {
          orderId: order.id,
          userId: request.user.id,
        },
        automatic_payment_methods: { enabled: true },
      })

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentId: paymentIntent.id },
        include: orderInclude,
      })

      return reply.status(201).send({ order: updatedOrder, paymentIntent })
    } catch (error) {
      request.log.error({ err: error }, "Create order failed")
      const message = error instanceof ZodError
        ? validationMessage(error)
        : error instanceof Error
          ? error.message
          : validationMessage(error)
      return sendError(reply, 400, message)
    }
  })

  app.get("/orders", async (request) => {
    const orders = await prisma.order.findMany({
      where: { userId: request.user.id },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    })

    return { orders }
  })

  app.get("/orders/:id", async (request, reply) => {
    try {
      const { id } = parseInput(orderParamsSchema, request.params)
      const order = await prisma.order.findFirst({
        where: { id, userId: request.user.id },
        include: orderInclude,
      })

      if (!order) {
        return sendError(reply, 404, "Order not found")
      }

      return { order }
    } catch (error) {
      return sendError(reply, 400, validationMessage(error))
    }
  })
}

export default orderRoutes
