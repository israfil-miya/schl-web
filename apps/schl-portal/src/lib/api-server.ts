import { fetchApi } from '@repo/common/utils/general-utils';
import { redirect } from 'next/navigation';
import { auth } from '../auth';

export const fetchApiWithServerAuth = async <TData>(
    target: Parameters<typeof fetchApi>[0],
    options: RequestInit = {},
) => {
    const session = await auth();

    if (session?.error === 'RefreshAccessTokenError') {
        // The session is no longer valid.
        // This will trigger a redirect to the login page.
        redirect('/login');
    }

    const token = session?.accessToken ?? undefined;

    return fetchApi<TData>(target, options, token);
};
