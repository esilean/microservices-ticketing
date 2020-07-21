import { Publisher, ExpirationCompleteEvent, Subjects } from '@bevticketing/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}
