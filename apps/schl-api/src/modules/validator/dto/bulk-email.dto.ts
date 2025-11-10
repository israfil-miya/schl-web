import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEmail } from 'class-validator';

export class BulkEmailParamDto {
    @Transform(({ value }: { value: string }) => {
        if (typeof value !== 'string') return [];
        return value
            .split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0);
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsEmail({}, { each: true })
    emails: string[];
}
