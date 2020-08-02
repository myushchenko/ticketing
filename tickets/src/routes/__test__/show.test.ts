import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

it('should returns a 404 os the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('should returns the ticket if the ticket is found', async () => {
    const title = 'concert';
    const price = 20;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ title, price })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({})
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});