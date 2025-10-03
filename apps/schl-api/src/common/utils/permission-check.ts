import type { Permissions } from '../types/permission.type';
export const hasPerm = (perm: Permissions, userPermissions: Permissions[]) => {
    const permsSet = new Set(userPermissions);
    return permsSet.has(perm);
};

export const hasAnyPerm = (
    perms: Permissions[],
    userPermissions: Permissions[],
) => {
    const permsSet = new Set(userPermissions);
    return perms.some(perm => permsSet.has(perm));
};

export const toPermissions = (perms: string[]): Permissions[] => {
    return perms.filter((p): p is Permissions =>
        Object.values(Permissions).includes(p as Permissions),
    );
};
