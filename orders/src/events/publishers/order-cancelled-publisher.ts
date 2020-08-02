import { Publisher, Subjects, OrderCancelledEvent } from '@myu-tickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
