import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('should returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'test',
            price: 10,
        })
        .expect(404);
});

it('should returns a 401 if the user is not authenticad', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'test',
            price: 10,
        })
        .expect(401);
});

it('should returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
        title: 'test',
        price: 20,
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'update',
            price: 10,
        })
        .expect(401);
});

it('should returns a 400 if the user provides an invlaid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'test',
        price: 20,
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 10,
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'test',
            price: -10,
        })
        .expect(400);
});

it('should updates the ticket with valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'test',
        price: 20,
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'updated',
            price: 10,
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual('updated');
    expect(ticketResponse.body.price).toEqual(10);
});

it('should publish an event', async () => {
    const cookie = global.signin();
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'test',
        price: 20,
    });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'updated',
            price: 10,
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('should rejects updates if the ticket is reserved', async() => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'test',
            price: 20,
        });

    const ticket = await Ticket.findById(response.body.id);
    ticket?.set({orderId: mongoose.Types.ObjectId().toHexString()});
    await ticket?.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'updated',
            price: 10,
        })
        .expect(400);
});
