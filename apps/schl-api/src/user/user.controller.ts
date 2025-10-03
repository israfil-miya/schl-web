import { Body, Controller, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/common/auth/public.decorator';
import { UserSession } from 'src/common/types/user-session.type';
import { RequestHeader } from 'src/pipes/request-header.pipe';
import { ChangePasswordBodyDto } from './dto/change-password.dto';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { LoginBodyDto, LoginHeaderDto } from './dto/login.dto';
import {
    SearchUsersBodyDto,
    SearchUsersQueryDto,
} from './dto/search-users.dto';
import { VerifyUserBodyDto } from './dto/verify-user.dto';
import { AuthService } from './services/auth.service';
import { ManagementService } from './services/management.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly managementService: ManagementService,
    ) {}

    @Public()
    @Post('login')
    login(
        @Body() body: LoginBodyDto,
        @RequestHeader(LoginHeaderDto) header: LoginHeaderDto,
    ) {
        return this.authService.login(
            body.username,
            body.password,
            header.clientType,
        );
    }

    @Post('change-password')
    changePassword(@Body() body: ChangePasswordBodyDto) {
        return this.authService.changePassword(
            body.username,
            body.old_password,
            body.new_password,
        );
    }

    @Post('verify-user')
    verifyUser(
        @Body() body: VerifyUserBodyDto,
        @Req() req: Request & { user: UserSession },
        @Param('redirect') redirectPath: string,
    ) {
        return this.authService.verifyUser(
            body.username,
            body.password,
            req.user,
            redirectPath,
        );
    }

    @Post('create-user')
    createUser(
        @Body() body: CreateUserBodyDto,
        @Req() req: Request & { user: UserSession },
    ) {
        return this.managementService.createUser(body, req.user);
    }

    @Post('update-user/:id')
    updateUser(
        @Param('id') userId: string,
        @Body() userData: Partial<CreateUserBodyDto>,
        @Req() req: Request & { user: UserSession },
    ) {
        return this.managementService.updateUser(userId, userData, req.user);
    }

    @Post('delete-user/:id')
    deleteUser(
        @Param('id') userId: string,
        @Req() req: Request & { user: UserSession },
    ) {
        return this.managementService.deleteUser(userId, req.user);
    }

    @Post('search-users')
    searchUsers(
        @Query() query: SearchUsersQueryDto,
        @Body() body: SearchUsersBodyDto,
        @Req() req: Request & { user: UserSession },
    ) {
        const pagination = {
            page: query.page || 1,
            itemsPerPage: query.itemsPerPage || 30,
            isFiltered: query.filtered || false,
            isPaginated: query.paginated || false,
        };

        return this.managementService.searchUsers(body, pagination, req.user);
    }

    @Post('get-user/:id')
    getUser(
        @Param('id') userId: string,
        @Req() req: Request & { user: UserSession },
    ) {
        return this.managementService.getUserById(userId, req.user);
    }
}
