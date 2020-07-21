import { ExpirationCompleteListener } from '../../listeners/expiration-complete-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import generateMongoId from '../../../test/generate-mongo-id'
import { Order } from '../../../models/order'
import { OrderStatus, ExpirationCompleteEvent } from '@bevticketing/common'

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.stan)

  const ticket = Ticket.build({
    id: generateMongoId(),
    title: 'title',
    price: 10,
  })
  await ticket.save()

  const order = Order.build({
    status: OrderStatus.Created,
    userId: generateMongoId(),
    expiresAt: new Date(),
    ticket,
  })
  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, order, data, msg }
}

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup()

  await listener.onMessage(data, msg)
  expect(natsWrapper.stan.publish).toHaveBeenCalled()

  const eventData = JSON.parse((natsWrapper.stan.publish as jest.Mock).mock.calls[0][1])
  expect(eventData.id).toEqual(order.id)
})

it('ack the message on cancelling the order', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})
