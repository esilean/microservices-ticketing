import { Publisher, Subjects, TicketUpdatedEvent } from '@bevticketing/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
