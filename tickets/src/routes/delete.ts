import express, { Request, Response } from 'express'
import { Ticket } from '../model/tickets'
import { requireAuth, NotFoundError, NotAuthorizedError } from '@bevticketing/common'

const router = express.Router()

router.delete('/api/tickets/:id', requireAuth, async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    throw new NotFoundError()
  }

  if (ticket.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError()
  }

  ticket.remove()

  res.status(204).send({})
})

export { router as deleteTicketRouter }
