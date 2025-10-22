import { USER_PERMISSIONS } from '@repo/schemas/constants/permission.constant';
export type PermissionOptions = typeof USER_PERMISSIONS;

export type Permissions = PermissionOptions[number]['options'][number]['value'];

export type PermissionOption = {
    value: Permissions;
    label: string;
};
