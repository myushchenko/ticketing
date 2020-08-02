import request from 'supertest';
import mongoose from 'mongoose'
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    return ticket;
};

it('should fetches orders for an particular user', async () => {
    // Create three tickets
    const ticket1 = await buildTicket();
    const ticket2 = await buildTicket();
    const ticket3 = await buildTicket();

    // Sign two users
    const user1 = global.signin();
    const user2 = global.signin();
    // Create one order for User #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ ticketId: ticket1.id })
        .expect(201);
    // Create two orders for User #2
    const { body: order1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket2.id })
        .expect(201);
    const { body: order2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket3.id })
        .expect(201);
    // Make request to get orders for User #2
    const { body: orders } = await request(app)
        .get('/api/orders')
        .set('Cookie', user2)
        .expect(200);

    // Make sure we only got the ordesr for User #2
    expect(orders.length).toBe(2);
    expect(orders[0].id).toBe(order1.id);
    expect(orders[1].id).toBe(order2.id);
    expect(orders[0].ticket.id).toBe(ticket2.id);
    expect(orders[1].ticket.id).toBe(ticket3.id);
});
