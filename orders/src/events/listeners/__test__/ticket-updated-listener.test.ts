import { TicketUpdatedListener } from '../ticket-updated-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketUpdatedEvent } from '@bevticketing/common'
import generateMongoId from '../../../test/generate-mongo-id'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  // create an intance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.stan)

  // create and save the ticket
  const ticketId = generateMongoId()
  const ticket = Ticket.build({
    id: ticketId,
    title: 'title',
    price: 10,
  })
  await ticket.save()

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticketId,
    title: 'new title',
    price: 15,
    userId: generateMongoId(),
    version: ticket.version + 1,
  }

  // create a fake Message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg }
}

it('finds, updates and saves a ticket', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message on updating the ticket', async () => {
  const { listener, data, msg } = await setup()
  // call the onMessage function with the data + message
  await listener.onMessage(data, msg)
  //   // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data, msg } = await setup()

  data.version = 10

  try {
    await listener.onMessage(data, msg)
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled()
})
