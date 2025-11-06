import { IsNotEmpty } from 'class-validator';

export class ChangePasswordBodyDto {
    @IsNotEmpty()
    oldPassword: string;

    @IsNotEmpty()
    newPassword: string;
}
