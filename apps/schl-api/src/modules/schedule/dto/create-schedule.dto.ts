import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScheduleBodyDto {
    @IsString()
    @IsNotEmpty()
    receiveDate: string;

    @IsString()
    @IsNotEmpty()
    deliveryDate: string;

    @IsString()
    @IsNotEmpty()
    clientCode: string;

    @IsString()
    @IsNotEmpty()
    clientName: string;

    @IsString()
    @IsNotEmpty()
    task: string;

    @IsOptional()
    @IsString()
    comment?: string;
}
