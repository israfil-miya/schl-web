import { IsNotEmpty } from 'class-validator';

import { Expose } from 'class-transformer';

export class LoginBodyDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}

export class LoginHeaderDto {
    @IsNotEmpty()
    @Expose({ name: 'x-client-type' })
    clientType: 'portal' | 'crm';
}
