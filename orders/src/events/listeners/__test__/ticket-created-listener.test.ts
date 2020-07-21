import { TicketCreatedListener } from '../ticket-created-listener'

import { natsWrapper } from '../../../nats-wrapper'
import { TicketCreatedEvent } from '@bevticketing/common'
import generateMongoId from '../../../test/generate-mongo-id'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  // create an intance of the listener
  const listener = new TicketCreatedListener(natsWrapper.stan)

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: generateMongoId(),
    title: 'title',
    price: 10,
    userId: generateMongoId(),
    version: 0,
  }

  // create a fake Message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup()

  // call the onMessage function with the data + message
  await listener.onMessage(data, msg)

  //write assetions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id)

  expect(ticket).toBeDefined()
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)
})

it('acks the message on creating the ticket', async () => {
  const { listener, data, msg } = await setup()
  // call the onMessage function with the data + message
  await listener.onMessage(data, msg)
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled()
})
