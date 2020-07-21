import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Order } from '../../../models/order'
import generateMongoId from '../../../test/generate-mongo-id'
import { OrderStatus, OrderCreatedEvent } from '@bevticketing/common'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.stan)

  const data: OrderCreatedEvent['data'] = {
    id: generateMongoId(),
    version: 0,
    expiresAt: new Date().toISOString(),
    status: OrderStatus.Created,
    userId: generateMongoId(),
    ticket: {
      id: generateMongoId(),
      price: 10,
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}

it('creates an order', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const order = await Order.findById(data.id)

  expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message on creating the order', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
