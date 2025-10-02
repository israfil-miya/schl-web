import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserSession } from '../types/user-session.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('AUTH_SECRET'),
        });
    }

    validate(payload: any): UserSession {
        // `payload` is what we signed in the JWT token
        // Here, we can extract and return the user information we need
        return {
            db_id: payload.db_id,
            real_name: payload.real_name,
            cred_name: payload.cred_name,
            permissions: payload.permissions,
            role: payload.role,
            db_role_id: payload.db_role_id,
            accessToken: payload.accessToken,
        };
    }
}
// The returned value is attached to the request object as req.user
// We can then access it in your route handlers or guards
