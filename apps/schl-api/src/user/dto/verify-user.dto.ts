import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class VerifyUserBodyDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}

export class VerifyUserHeaderDto {
    @Expose({ name: 'x-redirect-path' })
    redirectPath?: string;
}
