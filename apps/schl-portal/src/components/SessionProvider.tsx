'use client';

import type { Session } from 'next-auth';
import {
    SessionProvider as NextAuthSessionProvider,
    useSession,
} from 'next-auth/react';
import React, { useEffect, useRef } from 'react';

type SessionProviderProps = {
    children: React.ReactNode;
    session?: Session | null;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
    refreshBufferSeconds?: number;
};
const MAX_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours cap
const DEFAULT_REFRESH_BUFFER_SECONDS = 0;

const SessionAutoRefresher: React.FC<{
    bufferSeconds: number;
}> = ({ bufferSeconds }) => {
    const { data: session, status, update } = useSession();
    const refreshTimeoutRef = useRef<number>();
    const lastImmediateRefreshRef = useRef<number>();

    useEffect(() => {
        const timeoutId = refreshTimeoutRef.current;
        if (timeoutId) {
            clearTimeout(timeoutId);
            refreshTimeoutRef.current = undefined;
        }

        if (status !== 'authenticated') return;

        const expires = session?.accessTokenExpires;
        if (!expires) return;

        const expiresAt = Number(expires);
        if (!Number.isFinite(expiresAt)) return;

        const refreshInMs = expiresAt - bufferSeconds * 1000 - Date.now();

        if (refreshInMs <= 0) {
            if (lastImmediateRefreshRef.current === expiresAt) return;
            lastImmediateRefreshRef.current = expiresAt;
            void update();
            return;
        }

        const scheduleInMs = Math.min(refreshInMs, MAX_TIMEOUT_MS);

        const id = window.setTimeout(() => {
            lastImmediateRefreshRef.current = undefined;
            void update();
        }, scheduleInMs);
        refreshTimeoutRef.current = id;

        return () => {
            clearTimeout(id);
            refreshTimeoutRef.current = undefined;
        };
    }, [bufferSeconds, session?.accessTokenExpires, status, update]);

    return null;
};

export default function SessionProvider({
    children,
    session,
    refetchInterval = 0,
    refetchOnWindowFocus = false,
    refreshBufferSeconds = DEFAULT_REFRESH_BUFFER_SECONDS,
}: SessionProviderProps) {
    const shouldAutoRefresh =
        typeof refreshBufferSeconds === 'number' && refreshBufferSeconds > 0;

    return (
        <NextAuthSessionProvider
            session={session}
            refetchInterval={refetchInterval}
            refetchOnWindowFocus={refetchOnWindowFocus}
        >
            {shouldAutoRefresh ? (
                <SessionAutoRefresher bufferSeconds={refreshBufferSeconds} />
            ) : null}
            {children}
        </NextAuthSessionProvider>
    );
}
