import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import { Ticket } from '../../../models/tickets'
import generateMongoId from '../../../test/generate-mongo-id'
import { OrderCreatedEvent, OrderStatus } from '@bevticketing/common'

const setup = async () => {
  // creata an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.stan)

  // create ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 10,
    userId: generateMongoId(),
  })
  await ticket.save()

  // create fake data
  const data: OrderCreatedEvent['data'] = {
    id: generateMongoId(),
    version: 0,
    status: OrderStatus.Created,
    userId: generateMongoId(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: 10,
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg }
}

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message on creating the order', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(natsWrapper.stan.publish).toHaveBeenCalled()

  const ticketUpdatedData = JSON.parse((natsWrapper.stan.publish as jest.Mock).mock.calls[0][1])

  expect(data.ticket.id).toEqual(ticketUpdatedData.id)
})
