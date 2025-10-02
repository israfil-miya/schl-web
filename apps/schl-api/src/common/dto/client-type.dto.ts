import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ClientTypeDto {
    @IsNotEmpty()
    @Expose({ name: 'x-client-type' })
    clientType: 'portal' | 'crm';
}
