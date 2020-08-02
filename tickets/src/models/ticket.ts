import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// An interface that describe the properties
// that are required to create a new Ticket
interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

// An interface that describe the properties
// that a Ticket Document has
interface TicketDoc extends TicketAttrs, mongoose.Document {
    id: string;
    version: number;
    orderId?: string;
}

// An interface that describe the properties
// that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
        },
    },
    {
        toJSON: {
            transform(doc: TicketDoc, ret: TicketDoc) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
