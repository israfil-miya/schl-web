import { IsNotEmpty } from 'class-validator';

export class UploadFileHeadersDto {
    @IsNotEmpty()
    folderName: string;
}
