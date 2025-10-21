import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SingleEmailParamDto {
    @IsString()
    @Transform(({ value }: { value: string }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
