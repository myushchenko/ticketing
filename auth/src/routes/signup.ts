import express, { Request, Response } from 'express';
const { body } = require('express-validator');
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@myu-tickets/common';

import { User } from '../models/user';

const router = express.Router();

router.post(
    '/api/users/signup',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Passowrd must be between 4 and 20 characters'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new BadRequestError('Email in use!');
        }

        const user = User.build({ email, password });
        await user.save();

        // Generate JWT
        const userJwt = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_KEY!
        );

        // Store in session object
        req.session = {
            jwt: userJwt,
        } as any;

        res.status(201).send(user);
    }
);

export { router as signupRouter };
