import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Ticket } from '../models/tickets'
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  validateRequest,
} from '@bevticketing/common'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('price must be greater then zero'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      throw new NotFoundError()
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    })

    await ticket.save()

    await new TicketUpdatedPublisher(natsWrapper.stan).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    })

    res.send(ticket)
  }
)

export { router as updateTicketRouter }
