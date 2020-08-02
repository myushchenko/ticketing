import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signin(id?: string): string[];
        }
    }
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51HBHSDKuCyBMO8txkNlmh2S1vCA9CKI4bYKvi5evlfWH0psASEiQasR4WTbD7L5AptE2P6OUM15NAvkd2TZql14L00cWacdJlh';

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'secret';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

beforeEach(async () => {
    jest.clearAllMocks();

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (id?: string) => {
    // Build a JWT payload {id, email}
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
    };
    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    // Build session Object
    const session = { jwt: token };
    // Turn that session into JSOn
    const sessionJSON = JSON.stringify(session);
    // Take JSON and encode
    const base64 = Buffer.from(sessionJSON).toString('base64');
    // returns string thas the cookie with encoded data
    return [`express:sess=${base64}`];
};
