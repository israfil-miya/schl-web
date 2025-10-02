import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { UserSession } from 'src/common/types/user-session.type';
import { hasPerm, toPermissions } from 'src/common/utils/permission-check';
import { User } from 'src/models/user.schema';

interface PopulatedUser extends Omit<User, 'role_id'> {
    role_id: {
        name: string;
        permissions: string[];
    };
}

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly config: ConfigService,
    ) {}

    async handleLogin(
        username: string,
        password: string,
        clientType: 'portal' | 'crm',
    ) {
        const userData = await this.userModel
            .findOne({
                name: username,
                password: password,
            })
            .populate('role_id', 'name permissions')
            .lean<PopulatedUser>()
            .exec();

        if (userData) {
            const userPermissions = toPermissions(userData.role_id.permissions);

            if (!hasPerm(`login:${clientType}`, userPermissions)) {
                return {
                    code: 403,
                    message: 'You are not authorized to login here',
                };
            }
            return {
                code: 200,
                user: userData,
            };
        }
        return { code: 401, message: 'Invalid username or password' };
    }

    async handleChangePassword(
        username: string,
        old_password: string,
        new_password: string,
    ) {
        const userData = await this.userModel
            .findOne({
                name: username,
                password: old_password,
            })
            .exec();
        if (!userData) {
            return { code: 401, message: 'Invalid username or password' };
        }

        userData.password = new_password;
        await userData.save();

        return { code: 200, message: 'Password changed successfully' };
    }

    async handleVerifyUser(
        username: string,
        password: string,
        userSession: UserSession,
        redirectPath: string = '/',
    ) {
        const userData = await this.userModel
            .findOne({
                name: username,
                password: password,
            })
            .exec();

        if (!userData) {
            throw new UnauthorizedException('Invalid username or password');
        }

        if (userData.name === userSession.cred_name) {
            const token = jwt.sign(
                {
                    userId: userData._id,
                    exp: Math.floor(Date.now() / 1000) + 10,
                },
                this.config.get<string>('AUTH_SECRET')!,
            );

            return { token, redirect_path: redirectPath };
        } else {
            throw new ForbiddenException(
                'You are not authorized to verify this user',
            );
        }
    }
}
