import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { Approval, ApprovalSchema } from '@repo/schemas/approval.schema';
import { Client, ClientSchema } from '@repo/schemas/client.schema';
import { Employee, EmployeeSchema } from '@repo/schemas/employee.schema';
import { Order, OrderSchema } from '@repo/schemas/order.schema';
import { Report, ReportSchema } from '@repo/schemas/report.schema';
import { Role, RoleSchema } from '@repo/schemas/role.schema';
import { Schedule, ScheduleSchema } from '@repo/schemas/schedule.schema';
import { User, UserSchema } from '@repo/schemas/user.schema';

import { ApprovalController } from './approval.controller';

import { ApprovalService } from './approval.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Approval.name, schema: ApprovalSchema },
            { name: User.name, schema: UserSchema },
            { name: Client.name, schema: ClientSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Report.name, schema: ReportSchema },
            { name: Schedule.name, schema: ScheduleSchema },
            { name: Employee.name, schema: EmployeeSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
    ],

    controllers: [ApprovalController],

    providers: [ApprovalService],
})
export class ApprovalModule {}
