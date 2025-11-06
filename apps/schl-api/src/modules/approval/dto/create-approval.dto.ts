import { Change } from '@repo/common/utils/changes-generate';
import { IsArray, IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateApprovalBodyDto {
    @IsIn(['User', 'Report', 'Employee', 'Order', 'Client', 'Schedule'])
    targetModel:
        | 'User'
        | 'Report'
        | 'Employee'
        | 'Order'
        | 'Client'
        | 'Schedule';

    @IsIn(['create', 'update', 'delete'])
    action: 'create' | 'update' | 'delete';

    // Required for update/delete
    @IsOptional()
    @IsString()
    objectId?: string;

    // Required for update
    @IsOptional()
    @IsArray()
    changes?: Change[];

    // Required for create
    @IsOptional()
    @IsObject()
    newData?: Record<string, any> | null;

    // Required for delete
    @IsOptional()
    @IsObject()
    deletedData?: Record<string, any> | null;
}
