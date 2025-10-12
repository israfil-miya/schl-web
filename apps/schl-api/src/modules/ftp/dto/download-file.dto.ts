import { IsNotEmpty } from 'class-validator';

export class DownloadFileQueryDto {
    @IsNotEmpty()
    fileName: string;

    @IsNotEmpty()
    folderName: string;
}
