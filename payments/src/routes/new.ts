import { body } from 'express-validator';
import express, { Request, Response } from 'express';
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    BadRequestError,
    NotAuthorizedError,
    OrderStatus,
} from '@myu-tickets/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
    [
        body('token').not().isEmpty().withMessage('Token must be provided'),
        body('orderId').not().isEmpty().withMessage('OrderId must be provided'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser?.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for an cancelled order');
        }

        const charge = await stripe.charges.create({
            amount: order.price * 100,
            currency: 'usd',
            source: token,
        });

        const payment = Payment.build({
            orderId,
            stripeId: charge.id,
        });
        await payment.save();

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.id,
        });

        res.status(201).send(payment);
    }
);

export { router as createChargetRouter };
