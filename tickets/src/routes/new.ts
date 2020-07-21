import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '@bevticketing/common'

import { Ticket } from '../models/tickets'

import { natsWrapper } from '../nats-wrapper'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'

const router = express.Router()

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').notEmpty().withMessage('title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('price must be greater than zero'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    })

    await ticket.save()

    await new TicketCreatedPublisher(natsWrapper.stan).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    })

    res.status(201).send(ticket)
  }
)

export { router as createTicketRouter }
