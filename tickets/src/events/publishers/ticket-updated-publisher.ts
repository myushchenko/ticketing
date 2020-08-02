import { Publisher, Subjects, TicketUpdatedEvent } from '@myu-tickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
