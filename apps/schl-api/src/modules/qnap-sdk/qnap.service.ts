import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QNAP_ERROR_MAP } from '@repo/common/constants/qnap.constant';
import axios, { AxiosInstance } from 'axios';
import {
    ApiResponse,
    DeleteOptions,
    ListOptions,
    LoginResponse,
    QnapApiError,
} from './qnap.types';
import type { QnapSessionStore } from './session/session-store.interface';

@Injectable()
export class QnapService implements OnModuleDestroy {
    private readonly http: AxiosInstance;
    private readonly logger = new Logger(QnapService.name);

    constructor(
        private readonly configService: ConfigService,
        @Inject('QNAP_SESSION_STORE')
        private readonly sessionStore: QnapSessionStore,
    ) {
        const host = this.configService.get<string>('QNAP_HOST');
        const port = this.configService.get<number>('QNAP_PORT') || 8080;
        const https = this.configService.get<string>('QNAP_HTTPS') === 'true';

        const protocol = https ? 'https' : 'http';
        const baseUrl = `${protocol}://${host}:${port}`;

        this.http = axios.create({
            baseURL: baseUrl,
            timeout: 30000, // 30s timeout
        });
    }

    /**
     * Encodes password for QNAP (Base64 -> URL Encoded)
     */
    private ezEncode(str: string): string {
        return encodeURIComponent(Buffer.from(str, 'utf8').toString('base64'));
    }

    /**
     * Core request handler with Auto-Relogin capability
     */
    private async requestWithAuth(
        endpoint: string,
        params: Record<string, any> = {},
        retry = true,
    ): Promise<ApiResponse> {
        let sid = await this.sessionStore.getSid();

        // If no session exists, login immediately
        if (!sid) {
            this.logger.log('No active session found. Logging in...');
            const loginData = await this.login();
            sid = loginData.sid;
        }

        try {
            const response = await this.http.get(endpoint, {
                params: { ...params, sid },
            });
            const data = response.data as ApiResponse;

            // Status 3 means Session Expired
            if (data.status === 3 && retry) {
                this.logger.warn(
                    'Session expired (Status 3). Re-authenticating...',
                );
                await this.login();
                return this.requestWithAuth(endpoint, params, false); // Retry once
            }

            // Check for other error statuses
            this.checkStatus(data, 'requestWithAuth');

            return data;
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            throw new QnapApiError('network', 0, message);
        }
    }

    private checkStatus(data: ApiResponse, context: string): void {
        if (data.status !== undefined && data.status !== 1) {
            const errorMessage =
                QNAP_ERROR_MAP[data.status] ||
                `API returned status ${data.status}`;
            throw new QnapApiError(context, data.status, errorMessage);
        }
    }

    async login(): Promise<LoginResponse> {
        const username = this.configService.get<string>('QNAP_USERNAME') || '';
        const password = this.configService.get<string>('QNAP_PASSWORD') || '';
        const encodedPassword = this.ezEncode(password);
        const response = await this.http.get(
            '/cgi-bin/filemanager/wfm2Login.cgi',
            {
                params: {
                    user: username,
                    pwd: encodedPassword,
                },
            },
        );

        const data = response.data as LoginResponse & { status?: number };

        if (!data.sid) {
            throw new QnapApiError(
                'login',
                data.status || 0,
                'Login failed: No SID returned',
            );
        }

        await this.sessionStore.setSid(data.sid);
        this.logger.log(
            `Logged in successfully. SID: ${data.sid.substring(0, 5)}...`,
        );
        return data;
    }

    async logout(): Promise<void> {
        const sid = await this.sessionStore.getSid();
        if (sid) {
            await this.http.get('/cgi-bin/filemanager/wfm2Logout.cgi', {
                params: { sid },
            });
            await this.sessionStore.setSid(null);
        }
    }

    // --- File Operations ---

    async listFolderContents(options: ListOptions) {
        const data = await this.requestWithAuth(
            '/cgi-bin/filemanager/utilRequest.cgi',
            {
                func: 'get_list',
                is_iso: 0,
                list_mode: 'all',
                path: options.path,
                dir: options.dir || 'ASC',
                limit: options.limit || 100,
                sort: options.sort || 'filename',
                start: options.start || 0,
                hidden_file: options.hidden_file || 0,
            },
        );
        this.checkStatus(data, 'listFolderContents');
        return data;
    }

    async createFolder(
        destPath: string,
        folderName: string,
    ): Promise<ApiResponse> {
        const data = await this.requestWithAuth(
            '/cgi-bin/filemanager/utilRequest.cgi',
            {
                func: 'createdir',
                dest_path: destPath,
                dest_folder: folderName,
            },
        );
        this.checkStatus(data, 'createFolder');
        return data;
    }

    async rename(
        path: string,
        oldName: string,
        newName: string,
    ): Promise<ApiResponse> {
        const data = await this.requestWithAuth(
            '/cgi-bin/filemanager/utilRequest.cgi',
            {
                func: 'rename',
                path,
                source_name: oldName,
                dest_name: newName,
            },
        );
        this.checkStatus(data, 'rename');
        return data;
    }

    async move(
        sourcePath: string,
        items: string[],
        destPath: string,
        mode: 0 | 1 = 1,
    ): Promise<ApiResponse> {
        const base: Record<string, any> = {
            func: 'move',
            source_path: sourcePath,
            dest_path: destPath,
            source_total: items.length,
            mode,
        };

        // Build a flat array of key-value pairs so axios repeats the key
        const params: Record<string, any> = { ...base };
        items.forEach((item, idx) => {
            params[`source_file[${idx}]`] = item;
        });

        const data = await this.requestWithAuth(
            '/cgi-bin/filemanager/utilRequest.cgi',
            params,
        );
        this.checkStatus(data, 'move');
        return data;
    }

    async delete(
        path: string,
        items: string[],
        options: DeleteOptions = {},
    ): Promise<ApiResponse> {
        const baseParams: Record<string, any> = {
            func: 'delete',
            path,
            file_total: items.length,
            v: 1,
        };

        if (options.force) {
            baseParams.force = 1;
        }

        // Build a flat array of key-value pairs so axios repeats the key
        const params: Record<string, any> = { ...baseParams };
        items.forEach((item, idx) => {
            params[`file_name[${idx}]`] = item;
        });

        const data = await this.requestWithAuth(
            '/cgi-bin/filemanager/utilRequest.cgi',
            params,
        );
        this.checkStatus(data, 'delete');
        return data;
    }

    async onModuleDestroy() {
        // Optional: Logout on shutdown.
        // In serverless, this might not always run, which is why TTL in Mongo is important.
        try {
            await this.logout();
        } catch {
            // Ignore logout errors
        }
    }
}
