import { IsOptional, IsString } from 'class-validator';

export class ClientCodeQueryDto {
    @IsOptional()
    @IsString()
    code?: string;
}

export class OrderTypeQueryDto {
    @IsOptional()
    @IsString()
    orderType?: 'general' | 'test' | 'qc';
}
