import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class MoveFileDto {
    @IsString()
    @IsNotEmpty()
    sourcePath: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    items: string[];

    @IsString()
    @IsNotEmpty()
    destPath: string;

    @IsOptional()
    @IsEnum([0, 1])
    mode?: 0 | 1;
}
