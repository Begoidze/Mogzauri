import type { FastifyPluginAsync } from "fastify"
import Stripe from "stripe"
import { ZodError, z } from "zod"
import { prisma } from "../lib/prisma"
import {
  parseInput,
  publicErrorMessage,
  publicErrorStatus,
  PublicError,
  sendError,
  validationMessage,
} from "../lib/http"

const orderParamsSchema = z.object({
  id: z.string().min(1, "Order id is required"),
})

const createOrderSchema = z.object({
  shippingName: z.string().trim().min(2, "Shipping name is required"),
  shippingPhone: z.string().trim().min(5, "Shipping phone is required"),
  shippingAddress: z.string().trim().min(3, "Shipping address is required"),
  ageConfirmed: z.boolean().refine((value) => value, {
    message: "You must confirm that you are old enough to buy alcohol",
  }),
  idempotencyKey: z.string().trim().min(16, "Idempotency key is required").max(128).optional(),
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
      const idempotencyHeader = request.headers["idempotency-key"]
      const idempotencyKey = typeof idempotencyHeader === "string"
        ? idempotencyHeader.trim()
        : body.idempotencyKey

      if (!idempotencyKey) {
        return sendError(reply, 400, "Idempotency key is required")
      }

      const existingOrder = await prisma.order.findFirst({
        where: { userId: request.user.id, idempotencyKey },
        include: orderInclude,
      })

      if (existingOrder) {
        const existingPaymentIntent = existingOrder.stripePaymentId
          ? await stripe.paymentIntents.retrieve(existingOrder.stripePaymentId)
          : null

        return reply.status(200).send({
          order: existingOrder,
          clientSecret: existingPaymentIntent?.client_secret ?? null,
        })
      }

      const cartItems = await prisma.cartItem.findMany({
        where: { userId: request.user.id },
        include: { product: true },
        orderBy: { createdAt: "asc" },
      })

      if (cartItems.length === 0) {
        throw new PublicError("Cart is empty", 400)
      }

      const inactiveItem = cartItems.find((item) => !item.product.active)
      if (inactiveItem) {
        throw new PublicError(`${inactiveItem.product.name} is no longer available`, 409)
      }

      const outOfStockItem = cartItems.find((item) => item.quantity > item.product.stock)
      if (outOfStockItem) {
        throw new PublicError(`${outOfStockItem.product.name} does not have enough stock`, 409)
      }

      const total = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

      // Create PaymentIntent BEFORE mutating the database.
      // If Stripe fails here, no stock is decremented and no order is created.
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: process.env.STRIPE_CURRENCY ?? "gel",
        metadata: { userId: request.user.id, idempotencyKey },
        automatic_payment_methods: { enabled: true },
      }, {
        idempotencyKey: `order:${request.user.id}:${idempotencyKey}`,
      })

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
            throw new PublicError(`${item.product.name} does not have enough stock`, 409)
          }
        }

        const createdOrder = await tx.order.create({
          data: {
            userId: request.user.id,
            total,
            stripePaymentId: paymentIntent.id,
            idempotencyKey,
            ageConfirmed: body.ageConfirmed,
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

      return reply.status(201).send({ order, clientSecret: paymentIntent.client_secret })
    } catch (error) {
      request.log.error({ err: error }, "Create order failed")
      const message = error instanceof ZodError
        ? validationMessage(error)
        : publicErrorMessage(error, "Unable to create order")
      return sendError(reply, publicErrorStatus(error), message)
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
