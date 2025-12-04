import {
    FILE_CONDITIONS,
    JOB_SELECTION_TYPES,
    type FileCondition,
    type JobSelectionType,
} from '@repo/common/constants/order.constant';
import { IsIn, IsString } from 'class-validator';

export class ListFilesQueryDto {
    @IsString()
    folderPath: string;

    @IsString()
    @IsIn(JOB_SELECTION_TYPES as readonly JobSelectionType[])
    jobType: JobSelectionType;

    @IsString()
    @IsIn(FILE_CONDITIONS as readonly FileCondition[])
    fileCondition: FileCondition;
}
