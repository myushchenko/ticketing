import request from 'supertest';
import moongose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// jest.mock('../../stripe');

it('should returns a 404 when purchasing an ordr that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'token',
            orderId: moongose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it('should returns a 401 when purchasing an order that belong to other user', async () => {
    const order = Order.build({
        id: moongose.Types.ObjectId().toHexString(),
        userId: moongose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        price: 10,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'token',
            orderId: order.id,
        })
        .expect(401);
});

it('should returns a 400 when purchasing a cancelled order', async () => {
    const userId = moongose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: moongose.Types.ObjectId().toHexString(),
        userId,
        status: OrderStatus.Cancelled,
        version: 0,
        price: 10,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'token',
            orderId: order.id,
        })
        .expect(400);
});

it('should returns a 201 with valid inputs', async () => {
    const userId = moongose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 1000);
    const order = Order.build({
        id: moongose.Types.ObjectId().toHexString(),
        userId,
        price,
        status: OrderStatus.Created,
        version: 0,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        })
        .expect(201);

    const chargeCharges = await stripe.charges.list({ limit: 50 });
    const chargeCharge = chargeCharges.data.find((charge) => {
        return charge.amount === price * 100;
    });

    expect(chargeCharge).toBeDefined();
    expect(chargeCharge!.currency).toEqual('usd');

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: chargeCharge?.id,
    });
    expect(payment).not.toBeNull();
});

/*it('should returns a 201 with valid inputs', async () => {
    const userId = moongose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: moongose.Types.ObjectId().toHexString(),
        userId,
        status: OrderStatus.Created,
        version: 0,
        price: 10,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        })
        .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(10 * 100);
    expect(chargeOptions.currency).toEqual('usd');
});
*/
