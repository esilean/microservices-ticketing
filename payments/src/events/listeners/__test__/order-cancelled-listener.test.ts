import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Order } from '../../../models/order'
import generateMongoId from '../../../test/generate-mongo-id'
import { OrderStatus, OrderCancelledEvent } from '@bevticketing/common'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.stan)

  const orderId = generateMongoId()
  const order = Order.build({
    id: orderId,
    version: 0,
    userId: generateMongoId(),
    status: OrderStatus.Created,
    price: 10,
  })
  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: order.version + 1,
    ticket: {
      id: generateMongoId(),
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, order, data, msg }
}

it('cancels the order', async () => {
  const { listener, order, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message on cancelling the order', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
