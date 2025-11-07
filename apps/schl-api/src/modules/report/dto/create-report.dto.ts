import {
    CLIENT_STATUSES,
    type ClientStatus,
} from '@repo/common/constants/report.constant';
import { toBoolean } from '@repo/common/utils/transformers';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsIn,
    IsOptional,
    IsString,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    isEmail,
} from 'class-validator';

const normalizeEmailList = (raw: unknown): string | undefined => {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw !== 'string') return undefined;

    const parts = raw
        .split('/')
        .map(part => part.trim())
        .filter(part => part.length > 0);

    if (!parts.length) return undefined;

    return parts.join(' / ');
};

const splitEmailList = (value: string): string[] =>
    value
        .split('/')
        .map(part => part.trim())
        .filter(part => part.length > 0);

@ValidatorConstraint({ name: 'multiEmailString', async: false })
export class MultiEmailStringConstraint
    implements ValidatorConstraintInterface
{
    validate(value: unknown): boolean {
        console.log('Validating emails:', value);
        if (value === undefined || value === null || value === '') {
            return true;
        }

        if (typeof value !== 'string') {
            return false;
        }

        const emails = splitEmailList(value);
        if (!emails.length) {
            return true;
        }

        return emails.every(email => isEmail(email));
    }

    defaultMessage(): string {
        return 'each email must be valid and separated by " / "';
    }
}

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
    @Transform(({ value }) => normalizeEmailList(value))
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
