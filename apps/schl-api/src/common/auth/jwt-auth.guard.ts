// auth/jwt-auth.guard.ts
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Skip public routes
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) return true;

        // DEBUG HEADER LOGGING (remove or disable in production)
        try {
            const req = context.switchToHttp().getRequest();
            if (req) {
                const headers = req.headers || {};
                const authHeader: string | undefined =
                    (headers['authorization'] as string | undefined) ||
                    (headers['Authorization'] as string | undefined);
                let authPreview = 'NONE';
                if (authHeader) {
                    // Show only scheme + first 10 chars of token to avoid leaking secrets
                    const [scheme, token] = authHeader.split(' ');
                    authPreview = `${scheme || 'Unknown'} ${token ? token.slice(0, 10) + '...' : ''}`;
                }
                // this.logger.debug(
                //     `Incoming ${req.method} ${req.url} | Auth: ${authPreview}`,
                // );
            }
        } catch (e) {
            // this.logger.warn(`Header logging failed: ${(e as Error).message}`);
        }

        return super.canActivate(context);
    }
}
