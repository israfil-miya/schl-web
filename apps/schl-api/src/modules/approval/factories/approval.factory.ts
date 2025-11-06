import { Approval } from '@repo/common/models/approval.schema';
import mongoose from 'mongoose';
import { CreateApprovalBodyDto } from '../dto/create-approval.dto';

export class ApprovalFactory {
    static fromCreateDto(
        dto: CreateApprovalBodyDto,
        reqByUserId: string,
    ): Partial<Approval> {
        const payload: Partial<Approval> & { [key: string]: any } = {
            target_model: dto.targetModel,
            action: dto.action,
            req_by: new mongoose.Types.ObjectId(reqByUserId),
        };

        if (dto.objectId) {
            payload.object_id = new mongoose.Types.ObjectId(dto.objectId);
        }
        if (dto.action === 'create') {
            payload.new_data = dto.newData ?? null;
        }
        if (dto.action === 'update') {
            payload.changes = dto.changes ?? [];
        }
        if (dto.action === 'delete') {
            payload.deleted_data = dto.deletedData ?? null;
        }

        return payload as Partial<Approval>;
    }
}
