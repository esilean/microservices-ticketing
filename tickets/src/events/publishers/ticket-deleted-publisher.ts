import { Publisher, Subjects, TicketDeletedEvent } from '@bevticketing/common'

export class TicketDeletedPublisher extends Publisher<TicketDeletedEvent> {
  readonly subject = Subjects.TicketDeleted
}
