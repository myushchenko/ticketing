import { Publisher, Subjects, TicketCreatedEvent } from '@myu-tickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
