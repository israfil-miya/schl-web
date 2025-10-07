import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScheduleBodyDto {
    @IsString()
    @IsNotEmpty()
    receive_date: string;

    @IsString()
    @IsNotEmpty()
    delivery_date: string;

    @IsString()
    @IsNotEmpty()
    client_code: string;

    @IsString()
    @IsNotEmpty()
    client_name: string;

    @IsString()
    @IsNotEmpty()
    task: string;

    @IsOptional()
    @IsString()
    comment?: string;
}
