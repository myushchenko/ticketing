import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent, OrderStatus } from '@myu-tickets/common';

import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompletListener } from '../expiration-complete-listener';

const setup = async () => {
    // create an instance of listener
    const listener = new ExpirationCompletListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    const order = Order.build({
        userId: 'u1',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    // create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, order, ticket, msg };
};

it('should updates the order status to cancelled', async () => {
    const { listener, data, order, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('should emit an OrderCancelled event', async () => {
    const { listener, data, order, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);
});

it('should acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
