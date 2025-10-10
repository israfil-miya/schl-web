import { IsNotEmpty } from 'class-validator';

export class ReportStatusesQueryDto {
    @IsNotEmpty()
    fromDate: string; // YYYY-MM-DD

    @IsNotEmpty()
    toDate: string; // YYYY-MM-DD
}

export class ReportStatusesByNameQueryDto {
    @IsNotEmpty()
    fromDate: string; // YYYY-MM-DD

    @IsNotEmpty()
    toDate: string; // YYYY-MM-DD
}
