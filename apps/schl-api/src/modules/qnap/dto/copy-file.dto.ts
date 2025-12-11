import {
    ArrayNotEmpty,
    IsArray,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CopyFileDto {
    @IsString()
    @IsNotEmpty()
    sourcePath: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    items: string[];

    @IsString()
    @IsNotEmpty()
    destPath: string;

    @IsOptional()
    @IsIn([0, 1, 2])
    mode?: 0 | 1 | 2;

    @IsOptional()
    @IsString()
    dup?: string;

    @IsOptional()
    @IsIn([0, 1])
    checksum?: 0 | 1;

    @IsOptional()
    @IsInt()
    sourcePort?: number;

    @IsOptional()
    @IsInt()
    destPort?: number;

    @IsOptional()
    @IsInt()
    waitSec?: number;

    @IsOptional()
    @IsIn([0, 1])
    restoreLog?: 0 | 1;
}
