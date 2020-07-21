import { Publisher, OrderCancelledEvent, Subjects } from '@bevticketing/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
