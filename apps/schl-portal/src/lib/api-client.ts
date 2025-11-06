'use client';

import {
    fetchApi,
    type FetchApiResponse,
    type NestJsError,
} from '@repo/common/utils/general-utils';
import { isArray } from 'lodash';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const useAuthedFetchApi = () => {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (session?.error === 'RefreshAccessTokenError') {
            toast.error('Your session has expired. Please log in again.');
            signOut({ callbackUrl: '/login' });
        }
    }, [session]);

    return useCallback(
        async <TData>(
            target: Parameters<typeof fetchApi>[0],
            options: RequestInit = {},
        ): Promise<FetchApiResponse<TData>> => {
            if (status === 'loading') {
                // Prevent API calls while session is loading.
                // The component should handle this loading state.
                return {
                    ok: false,
                    status: 0, // Special status to indicate a non-HTTP failure
                    data: { message: 'Session is loading' },
                } as FetchApiResponse<any>;
            }

            if (status !== 'authenticated' || !session?.accessToken) {
                return {
                    ok: false,
                    status: 401,
                    data: {
                        statusCode: 401,
                        message: 'Unauthorized',
                    },
                } as FetchApiResponse<TData>;
            }

            return fetchApi<TData>(target, options, session.accessToken);
        },
        [session, status],
    );
};

export const toastFetchError = (
    response: FetchApiResponse<unknown>,
    fallbackMessage?: string,
    toastId?: string,
) => {
    if (response.ok) return;

    // Do not show a toast if the request was held back because the session was loading.
    if (
        response.status === 0 &&
        (response.data as any)?.message === 'Session is loading'
    ) {
        return;
    }

    const error = response.data as NestJsError | undefined;

    if (!error?.message) {
        if (fallbackMessage) {
            toast.error(fallbackMessage, { id: toastId || 'default-toast-id' });
        }
        return;
    }

    if (isArray(error.message)) {
        error.message.forEach((msg: string) =>
            toast.error(msg, { id: toastId || 'default-toast-id' }),
        );
        return;
    }

    toast.error(error.message, { id: toastId || 'default-toast-id' });
};
