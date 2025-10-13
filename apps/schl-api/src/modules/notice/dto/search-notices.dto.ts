import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class SearchNoticesQueryDto {
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(200)
    itemsPerPage: number = 30;

    @Type(() => Boolean)
    @IsBoolean()
    filtered: boolean = false;

    @Type(() => Boolean)
    @IsBoolean()
    paginated: boolean = true;
}

export class SearchNoticesBodyDto {
    @IsOptional()
    @IsString()
    channel?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    noticeNo?: string;

    @IsOptional()
    @IsString()
    fromDate?: string; // YYYY-MM-DD

    @IsOptional()
    @IsString()
    toDate?: string; // YYYY-MM-DD
}
