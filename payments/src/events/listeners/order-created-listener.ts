import { OrderCreatedEvent, Subjects, Listener } from '@bevticketing/common'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const {
      id,
      status,
      version,
      userId,
      ticket: { price },
    } = data

    const order = Order.build({
      id,
      status,
      version,
      userId,
      price,
    })
    await order.save()

    msg.ack()
  }
}
