import express, { Request, Response } from 'express'
import { requireAuth, NotFoundError, NotAuthorizedError, OrderStatus } from '@bevticketing/common'
import { Order } from '../models/order'

const router = express.Router()

router.delete('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    throw new NotFoundError()
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError()
  }

  order.status = OrderStatus.Cancelled
  await order.save()

  // Publish an event saying this was cancelled

  res.send(order)
})

export { router as deleteOrderRouter }
