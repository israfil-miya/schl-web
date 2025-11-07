import {
    CLIENT_STATUSES,
    type ClientStatus,
} from '@repo/common/constants/report.constant';
import { normalizeEmailListInput } from '@repo/common/utils/general-utils';
import { toBoolean } from '@repo/common/utils/transformers';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
    IsBoolean,
    IsIn,
    IsOptional,
    IsString,
    Validate,
} from 'class-validator';
import { MultiEmailStringConstraint } from '../../../common/validators/multi-email-string.validator';

const transformEmailList = ({
    value,
}: TransformFnParams): string | undefined => {
    const normalized = normalizeEmailListInput(value);
    return typeof normalized === 'string' ? normalized : undefined;
};

export class CreateReportBodyDto {
    @IsString()
    callingDate: string; // YYYY-MM-DD

    @IsOptional()
    @IsString()
    followupDate?: string; // YYYY-MM-DD or ''

    @IsString()
    country: string;

    @IsString()
    designation: string;

    @IsString()
    website: string;

    @IsString()
    category: string;

    @IsString()
    company: string;

    @IsString()
    contactPerson: string;

    @IsOptional()
    @IsString()
    contactNumber?: string;

    @IsOptional()
    @Transform(transformEmailList)
    @Validate(MultiEmailStringConstraint)
    email?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    linkedin?: string;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, false))
    @IsBoolean()
    followupDone?: boolean;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, false))
    @IsBoolean()
    prospecting?: boolean;

    @IsOptional()
    @IsString()
    prospectingStatus?: string;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, false))
    @IsBoolean()
    newLead?: boolean;

    @IsOptional()
    @IsString()
    leadOrigin?: string | null;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, false))
    @IsBoolean()
    testJob?: boolean;

    @IsString()
    @IsIn(CLIENT_STATUSES)
    clientStatus: ClientStatus;
}
