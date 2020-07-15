import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Ticket } from '../model/tickets'
import { requireAuth, NotFoundError, NotAuthorizedError, validateRequest } from '@bevticketing/common'

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

    res.send(ticket)
  }
)

export { router as updateTicketRouter }
