import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@myu-tickets/common';

import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from './../ticket-updated-listener';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // create an instance of listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();
    // create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: 'new concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: ticket.version + 1,
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, ticket, msg };
};

it('should finds, updates and saves a ticket', async () => {
    const { listener, data, ticket, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket?.title).toEqual(data.title);
    expect(updatedTicket?.price).toEqual(data.price);
    expect(updatedTicket?.version).toEqual(data.version);
});

it('should acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('should does not call ack in the event has skipped version number', async () => {
    const { listener, data, msg } = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (error) {}

    expect(msg.ack).not.toHaveBeenCalled();
});
