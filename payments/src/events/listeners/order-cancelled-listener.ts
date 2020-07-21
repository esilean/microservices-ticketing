import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  NotFoundError,
  OrderStatus,
} from '@bevticketing/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { Order } from '../../models/order'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { id, version } = data

    const order = await Order.findByIdAndPreviousVersion({ id, version })

    if (!order) {
      throw new NotFoundError()
    }

    order.set({ status: OrderStatus.Cancelled })
    await order.save()

    msg.ack()
  }
}
