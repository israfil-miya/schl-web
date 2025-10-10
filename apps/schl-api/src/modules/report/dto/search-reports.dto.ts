import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { toBoolean } from 'src/common/utils/transformers';

export class SearchReportsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    itemsPerPage: number = 30;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, false))
    @IsBoolean()
    filtered: boolean = false;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, false))
    @IsBoolean()
    paginated: boolean = false;
}

export class SearchReportsBodyDto {
    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    marketerName?: string;

    @IsOptional()
    @IsString()
    fromDate?: string; // YYYY-MM-DD

    @IsOptional()
    @IsString()
    toDate?: string; // YYYY-MM-DD

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, undefined))
    @IsBoolean()
    test?: boolean;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, undefined))
    @IsBoolean()
    prospect?: boolean;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, undefined))
    @IsBoolean()
    onlyLead?: boolean;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, undefined))
    @IsBoolean()
    followupDone?: boolean;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, undefined))
    @IsBoolean()
    regularClient?: boolean;

    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) => toBoolean(value, undefined))
    @IsBoolean()
    staleClient?: boolean;

    @IsOptional()
    @IsString()
    prospectStatus?: string;

    @IsOptional()
    @IsString()
    generalSearchString?: string;
}
