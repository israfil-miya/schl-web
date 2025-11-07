import {
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    Validate,
} from 'class-validator';

import {
    CLIENT_CURRENCY,
    type ClientCurrency,
} from '@repo/common/constants/client.constant';
import { normalizeEmailListInput } from '@repo/common/utils/general-utils';
import { Transform, TransformFnParams } from 'class-transformer';
import { MultiEmailStringConstraint } from '../../../common/validators/multi-email-string.validator';

const transformEmailList = ({
    value,
}: TransformFnParams): string | undefined => {
    const normalized = normalizeEmailListInput(value);
    return typeof normalized === 'string' ? normalized : undefined;
};

export class CreateClientBodyDto {
    @IsString()
    @IsNotEmpty()
    client_code: string;

    @IsString()
    @IsNotEmpty()
    client_name: string;

    @IsString()
    @IsNotEmpty()
    marketer: string;

    @IsString()
    @IsNotEmpty()
    contact_person: string;

    @IsString()
    @IsNotEmpty()
    contact_number: string;

    @IsString()
    @IsNotEmpty()
    @Transform(transformEmailList)
    @Validate(MultiEmailStringConstraint)
    email: string;

    @IsString()
    @IsNotEmpty()
    designation: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsOptional()
    @IsString()
    prices?: string;

    @IsIn(CLIENT_CURRENCY as readonly ClientCurrency[])
    currency: ClientCurrency;

    @IsOptional()
    @IsString()
    vat_number?: string;

    @IsOptional()
    @IsString()
    tax_id?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    last_invoice_number?: string | null;
}
