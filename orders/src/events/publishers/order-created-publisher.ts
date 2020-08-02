import { Publisher, Subjects, OrderCreatedEvent } from '@myu-tickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
