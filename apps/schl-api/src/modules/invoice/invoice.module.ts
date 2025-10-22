import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from '@repo/schemas/client.schema';
import { Invoice, InvoiceSchema } from '@repo/schemas/invoice.schema';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Invoice.name, schema: InvoiceSchema },
            { name: Client.name, schema: ClientSchema },
        ]),
    ],
    controllers: [InvoiceController],
    providers: [InvoiceService],
})
export class InvoiceModule {}
