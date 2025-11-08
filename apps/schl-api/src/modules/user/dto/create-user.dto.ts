import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class CreateUserBodyDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @MinLength(1)
    password: string;

    @IsMongoId()
    role: string; // role id

    @IsMongoId()
    employee: string; // role id

    @IsOptional()
    @IsString()
    comment?: string;
}
