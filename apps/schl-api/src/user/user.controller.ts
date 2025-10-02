import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/common/auth/public.decorator';
import { ClientTypeDto } from 'src/common/dto/client-type.dto';
import { UserSession } from 'src/common/types/user-session.type';
import { RequestHeader } from 'src/pipes/request-header.pipe';
import { ChangePasswordBodyDto } from './dto/change-password.dto';
import { LoginBodyDto } from './dto/login.dto';
import { VerifyUserBodyDto, VerifyUserHeaderDto } from './dto/verify-user.dto';
import { AuthService } from './services/auth.service';

@Controller('user')
export class UserController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    login(
        @Body() body: LoginBodyDto,
        @RequestHeader(ClientTypeDto) header: ClientTypeDto,
    ): any {
        return this.authService.handleLogin(
            body.username,
            body.password,
            header.clientType,
        );
    }

    @Post('change-password')
    changePassword(@Body() body: ChangePasswordBodyDto) {
        return this.authService.handleChangePassword(
            body.username,
            body.old_password,
            body.new_password,
        );
    }
    @Post('verify-user')
    verifyUser(
        @Body() body: VerifyUserBodyDto,
        @Req() req: Request & { user: UserSession },
        @RequestHeader(VerifyUserHeaderDto) header: VerifyUserHeaderDto,
    ) {
        return this.authService.handleVerifyUser(
            body.username,
            body.password,
            req.user,
            header.redirectPath,
        );
    }
}
