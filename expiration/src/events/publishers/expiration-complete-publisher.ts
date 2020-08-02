import { Publisher, Subjects, ExpirationCompleteEvent } from '@myu-tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
