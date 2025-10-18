import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ClientCodeParamDto {
    @IsOptional()
    @IsString()
    code?: string;
}

export class ClientCodeRequiredParamDto {
    @IsString()
    @IsNotEmpty()
    code: string;
}
