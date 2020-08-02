import { Message } from 'node-nats-streaming';
import { Listener, PaymentCreatedEvent, Subjects } from '@myu-tickets/common';

import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        //expirationQueue.close();

        msg.ack();
    }
}
