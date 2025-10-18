import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OrdersByCountryQueryDto {
    @IsOptional()
    @IsString()
    fromDate?: string;

    @IsOptional()
    @IsString()
    toDate?: string;
}

export class OrdersByCountryParamDto {
    @IsNotEmpty()
    @IsString()
    country: string;
}
