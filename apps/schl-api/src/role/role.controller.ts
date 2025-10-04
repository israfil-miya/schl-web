import { Body, Controller, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserSession } from 'src/common/types/user-session.type';
import {
    SearchRolesBodyDto,
    SearchRolesQueryDto,
} from './dto/search-roles.dto';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post('search-roles')
    searchRoles(
        @Query() query: SearchRolesQueryDto,
        @Body() body: SearchRolesBodyDto,
        @Req() req: Request & { user: UserSession },
    ) {
        const pagination = {
            page: query.page || 1,
            itemsPerPage: query.itemsPerPage || 30,
            isFiltered: query.filtered || false,
            isPaginated: query.paginated || false,
        };

        return this.roleService.searchRoles(body, pagination, req.user);
    }
}
