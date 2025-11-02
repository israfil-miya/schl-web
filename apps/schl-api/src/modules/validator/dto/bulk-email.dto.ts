import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsEmail, IsString } from 'class-validator';

export class BulkEmailParamDto {
    @IsString()
    @Transform(({ value }: { value: string }) => {
        if (typeof value !== 'string') return [];
        return value
            .split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0);
    })
    @ArrayNotEmpty()
    @IsEmail({}, { each: true })
    emails: string[];
}
