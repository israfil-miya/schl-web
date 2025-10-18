import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from 'src/models/client.schema';
import { Invoice, InvoiceSchema } from 'src/models/invoice.schema';
import { Order, OrderSchema } from 'src/models/order.schema';

import { OrderController } from './order.controller';

import { OrderService } from './order.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: Client.name, schema: ClientSchema },
            { name: Invoice.name, schema: InvoiceSchema },
        ]),
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {}
