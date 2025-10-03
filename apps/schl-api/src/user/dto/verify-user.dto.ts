import { IsNotEmpty } from 'class-validator';

export class VerifyUserBodyDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}
