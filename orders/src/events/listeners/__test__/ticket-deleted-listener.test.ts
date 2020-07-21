import { TicketDeletedListener } from '../ticket-deleted-listener'
import { natsWrapper } from '../../../nats-wrapper'
import generateMongoId from '../../../test/generate-mongo-id'
import { Ticket } from '../../../models/ticket'
import { TicketDeletedEvent } from '@bevticketing/common'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new TicketDeletedListener(natsWrapper.stan)

  const ticketId = generateMongoId()
  const ticket = Ticket.build({
    id: ticketId,
    title: 'title',
    price: 10,
  })
  await ticket.save()

  const data: TicketDeletedEvent['data'] = {
    id: ticketId,
    version: ticket.version + 1,
    userId: generateMongoId(),
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg }
}

it('finds and remove ticket', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const deletedTicket = await Ticket.findById(ticket.id)

  expect(deletedTicket).toBeNull()
})

it('acks the message on deleting the ticket', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
