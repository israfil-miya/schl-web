import { Expose, Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class SearchRolesQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Expose({ name: 'items-per-page' })
    @Type(() => Number)
    @IsInt()
    @Min(30)
    @Max(100)
    itemsPerPage: number = 30;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    filtered: boolean = false;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    paginated: boolean = false;
}

export class SearchRolesBodyDto {
    @IsOptional()
    @IsString()
    name?: string;
}
