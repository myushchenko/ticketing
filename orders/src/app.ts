import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@myu-tickets/common';

import { indexOrderRouter } from './routes';
import { showOrderRouter } from './routes/show';
import { createOrderRouter } from './routes/new';
import { deleteOrderRouter } from './routes/delete';

const app = express();
app.set('trust proxy', 1); // trust first proxy
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);
app.use(currentUser);

app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(createOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
