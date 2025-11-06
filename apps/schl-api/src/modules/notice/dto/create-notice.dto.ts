import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoticeBodyDto {
    @IsIn(['production', 'marketers'])
    channel: 'production' | 'marketers';

    @IsString()
    @IsNotEmpty()
    noticeNo: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsString()
    fileName?: string | null;
}
