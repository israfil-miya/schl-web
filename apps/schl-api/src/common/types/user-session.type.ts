import type { Permissions } from './permission.type';
export interface UserSession {
    db_id: string;
    real_name: string | null;
    cred_name: string;
    permissions: Permissions[];
    role: string;
    db_role_id: string;
    accessToken: string;
}
