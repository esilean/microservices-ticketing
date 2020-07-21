import express, { Request, Response } from 'express'
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
  BadRequestError,
} from '@bevticketing/common'
import { body } from 'express-validator'
import { Order } from '../models/order'
import { stripe } from '../gateways/stripe'

import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('token must be provided'),
    body('orderId').not().isEmpty().withMessage('orderId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)

    if (!order) {
      throw new NotFoundError()
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('cannot pay for a cancelled order')
    }

    if (order.status === OrderStatus.Complete) {
      throw new BadRequestError('cannot pay for a complete order')
    }

    // charge the user for the order
    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    })

    // save the payment
    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    })
    await payment.save()

    //publisher the payment:created event
    await new PaymentCreatedPublisher(natsWrapper.stan).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
      version: payment.version,
    })

    res.status(201).send(payment)
  }
)

export { router as createPaymentRouter }
