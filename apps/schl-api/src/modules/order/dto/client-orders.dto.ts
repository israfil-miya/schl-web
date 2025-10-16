import { IsNotEmpty } from 'class-validator';

export class ClientOrdersParamDto {
    @IsNotEmpty()
    code: string;
}
