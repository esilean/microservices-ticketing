import express, { Request, Response } from 'express'
import { Ticket } from '../models/tickets'
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
} from '@bevticketing/common'
import { TicketDeletedPublisher } from '../events/publishers/ticket-deleted-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.delete('/api/tickets/:id', requireAuth, async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    throw new NotFoundError()
  }

  if (ticket.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError()
  }

  if (ticket.orderId) {
    throw new BadRequestError('cannot delete a ticket that is reserved')
  }

  ticket.remove()

  await new TicketDeletedPublisher(natsWrapper.stan).publish({
    id: ticket.id,
    userId: ticket.userId,
    version: ticket.version,
  })

  res.status(204).send({})
})

export { router as deleteTicketRouter }
