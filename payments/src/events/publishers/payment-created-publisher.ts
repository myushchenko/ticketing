import { Publisher, Subjects, PaymentCreatedEvent } from '@myu-tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
