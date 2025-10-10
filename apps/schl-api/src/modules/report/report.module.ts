import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from 'src/models/client.schema';
import { Report, ReportSchema } from 'src/models/report.schema';
import { User, UserSchema } from 'src/models/user.schema';
import { ReportController } from './report.controller';
import { ReportService } from './services/report/report.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Report.name, schema: ReportSchema },
            { name: Client.name, schema: ClientSchema },
        ]),
    ],
    controllers: [ReportController],
    providers: [ReportService],
})
export class ReportModule {}
