import type {
    QnapDir,
    QnapSortField,
} from '@repo/common/constants/qnap.constant';

export interface QnapConfig {
    host: string;
    port?: number;
    username: string;
    password: string;
    https?: boolean;
}

export interface LoginResponse {
    status: number;
    sid: string;
    servername: string;
    username: string;
    authSid: string;
}

export interface ApiResponse {
    status: number;
    success?: string; // QNAP returns "true" string
    [key: string]: any;
}

export interface ListOptions {
    path: string;
    start?: number;
    limit?: number;
    sort?: QnapSortField;
    dir?: QnapDir;
    hidden_file?: 0 | 1;
}

export interface DeleteOptions {
    force?: boolean;
}

export class QnapApiError extends Error {
    constructor(
        public context: string,
        public status: number,
        message?: string,
    ) {
        super(message || `QNAP API error in ${context}: status ${status}`);
        this.name = 'QnapApiError';
    }
}
