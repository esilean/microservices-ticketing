import { Publisher, OrderCreatedEvent, Subjects } from '@bevticketing/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
