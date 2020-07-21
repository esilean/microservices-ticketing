import { Message } from 'node-nats-streaming'
import { Subjects, TicketDeletedEvent, Listener } from '@bevticketing/common'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketDeletedListener extends Listener<TicketDeletedEvent> {
  readonly subject = Subjects.TicketDeleted
  queueGroupName = queueGroupName

  async onMessage(data: TicketDeletedEvent['data'], msg: Message) {
    const { id } = data

    const ticket = await Ticket.findById(id)

    if (!ticket) {
      throw new Error('ticket not found')
    }

    await ticket.remove()

    msg.ack()
  }
}
