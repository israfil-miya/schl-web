import type { Permissions } from '@repo/schemas/types/permission.type';
import { FullyPopulatedUser } from '@repo/schemas/types/populated-user.type';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

export interface UserSessionType {
    db_id: string;
    db_role_id: string;
    permissions: Permissions[];
    real_name: string;
    e_id: string;
}

async function getUser(
    username: string,
    password: string,
): Promise<UserSessionType | null> {
    try {
        const res = await fetch(
            process.env.NEXT_PUBLIC_API_URL + '/user/login?clientType=portal',
            {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        if (res.status !== 200) return null;

        const data = (await res.json()) as FullyPopulatedUser;
        return {
            db_id: data._id.toString(),
            db_role_id: data.role._id,
            permissions: data.role.permissions || [],
            real_name: data.employee.real_name,
            e_id: data.employee.e_id,
        };
    } catch (e) {
        console.error(e);
        return null;
    }
}

const nextAuth = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const user = await getUser(
                    credentials?.username as string,
                    credentials?.password as string,
                );
                return user ?? null;
            },
        }),
    ],
});

// @ts-ignore
export const auth = nextAuth.auth;
// @ts-ignore
export const signIn = nextAuth.signIn;
// @ts-ignore
export const signOut = nextAuth.signOut;
// @ts-ignore
export const { GET, POST } = nextAuth.handlers;
