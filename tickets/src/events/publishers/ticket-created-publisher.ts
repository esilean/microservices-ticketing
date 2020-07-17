import { Publisher, Subjects, TicketCreatedEvent } from '@bevticketing/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
