import type { Permissions } from '../types/permission.type';
export const hasPerm = (perm: Permissions, userPermissions: Permissions[]) =>
    userPermissions?.includes(perm);

export const hasAnyPerm = (
    perms: Permissions[],
    userPermissions: Permissions[],
) => userPermissions?.some(item => perms.includes(item));

export const toPermissions = (perms: string[]): Permissions[] => {
    return perms.filter((p): p is Permissions =>
        Object.values(Permissions).includes(p as Permissions),
    );
};
