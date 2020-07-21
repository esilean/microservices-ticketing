import { Subjects, Publisher, PaymentCreatedEvent } from '@bevticketing/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
