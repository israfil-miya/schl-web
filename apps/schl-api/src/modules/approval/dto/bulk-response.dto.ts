import { IsArray, IsIn, IsMongoId, IsString } from 'class-validator';

export class BulkApprovalBodyDto {
    @IsArray()
    @IsString({ each: true })
    objectIds: string[];

    @IsIn(['approve', 'reject'])
    response: 'approve' | 'reject';

    @IsMongoId()
    @IsString()
    reviewedBy: string;
}
