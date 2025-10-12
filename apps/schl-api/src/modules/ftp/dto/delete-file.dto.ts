import { IsNotEmpty } from 'class-validator';

export class DeleteFileQueryDto {
    @IsNotEmpty()
    fileName: string;

    @IsNotEmpty()
    folderName: string;
}
