import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Permissions } from 'src/common/types/permission.type';
import { PopulatedUser } from 'src/common/types/populated-user.type';
import { UserSession } from 'src/common/types/user-session.type';
import { hasPerm, toPermissions } from 'src/common/utils/permission-check';
import { Role } from 'src/models/role.schema';
import { User } from 'src/models/user.schema';

@Injectable()
export class ManagementService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Role.name) private roleModel: Model<Role>,
        private readonly config: ConfigService,
    ) {}

    /**
     * Normalize an unknown permissions collection into a strongly typed `Permissions[]`
     * - Accepts unknown / mixed input
     * - Filters out non-string entries
     * - Uses shared `toPermissions` utility for canonical validation
     */
    private sanitizePermissions(perms: unknown): Permissions[] {
        if (!Array.isArray(perms)) return [];
        const stringPerms = perms.filter(
            (p): p is string => typeof p === 'string',
        );
        return toPermissions(stringPerms);
    }

    async createUser(userData: User, userSession: UserSession) {
        if (!hasPerm('admin:create_user', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to create users',
            );
        }

        const role = await this.roleModel
            .findById(userData.role_id)
            .select('permissions')
            .exec();
        if (!role) {
            throw new ForbiddenException('Invalid role_id provided');
        }

        const editorPermsArr = userSession.permissions;
        const rolePerms = this.sanitizePermissions((role as Role).permissions);

        // Super admin guard
        if (
            hasPerm('settings:the_super_admin', rolePerms) &&
            !hasPerm('settings:the_super_admin', editorPermsArr)
        ) {
            throw new ForbiddenException(
                'You cannot assign the_super_admin role',
            );
        }

        // Ensure editor has every permission being granted
        const invalid = rolePerms.filter(p => !hasPerm(p, editorPermsArr));
        if (invalid.length > 0) {
            throw new ForbiddenException(
                `You tried to assign permissions you don't have: ${invalid.join(', ')}`,
            );
        }

        const docCount = await this.userModel
            .countDocuments({ name: userData.name })
            .exec();
        if (docCount > 0) {
            throw new ForbiddenException('User with this name already exists');
        }

        const createdUser = await new this.userModel(userData).save();

        if (!createdUser) {
            throw new InternalServerErrorException('Failed to create user');
        }
        return createdUser;
    }

    async deleteUser(userId: string, userSession: UserSession) {
        if (!hasPerm('admin:delete_user_approval', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to delete users',
            );
        }

        // Load target user with role perms
        const target = await this.userModel
            .findById(userId)
            .populate('role_id', 'name permissions')
            .lean<PopulatedUser>()
            .exec();

        if (!target) {
            throw new NotFoundException('User not found');
        }
        const targetPerms = this.sanitizePermissions(
            target.role_id?.permissions,
        );

        // Disallow deleting a super admin user unless deleter is super admin
        if (
            hasPerm('settings:the_super_admin', targetPerms) &&
            !hasPerm('settings:the_super_admin', userSession.permissions)
        )
            throw new ForbiddenException(
                'You cannot delete a super admin user',
            );

        const result = await this.userModel.deleteOne({ _id: userId }).exec();

        if (result.deletedCount === 0) {
            throw new InternalServerErrorException('Failed to delete user');
        }

        // If the deleted user is the one currently logged in, we might want to handle session invalidation here
        // but since we don't have session management in this context, we'll skip that.

        return 'User deleted successfully';
    }

    async updateUser(
        userId: string,
        userData: Partial<User>,
        userSession: UserSession,
    ) {
        if (!hasPerm('admin:edit_user', userSession.permissions)) {
            throw new ForbiddenException(
                'You do not have permission to edit users',
            );
        }

        // Fetch current user with role permissions
        const current = await this.userModel
            .findById(userId)
            .populate('role_id', 'name permissions')
            .lean<PopulatedUser>()
            .exec();

        if (!current) {
            throw new NotFoundException('User not found');
        }

        const currentPerms = this.sanitizePermissions(
            current.role_id?.permissions,
        );

        // Disallow editing a super admin user unless editor is super admin
        if (
            hasPerm('settings:the_super_admin', currentPerms) &&
            !hasPerm('settings:the_super_admin', userSession.permissions)
        ) {
            throw new ForbiddenException("You can't edit this user");
        }

        // If role_id is changing, validate target role
        if (userData.role_id) {
            const targetRole = await this.roleModel
                .findById(userData.role_id)
                .select('permissions')
                .exec();

            if (!targetRole) {
                throw new BadRequestException('Invalid role');
            }

            const targetPerms = this.sanitizePermissions(
                targetRole.permissions,
            );

            if (
                hasPerm('settings:the_super_admin', targetPerms) &&
                !hasPerm('settings:the_super_admin', userSession.permissions)
            ) {
                throw new ForbiddenException(
                    "You can't assign a super admin role",
                );
            }

            const invalid = targetPerms.filter(
                p => !hasPerm(p, userSession.permissions),
            );
            if (invalid.length > 0) {
                throw new ForbiddenException(
                    `You tried to assign permissions you don't have: ${invalid.join(', ')}`,
                );
            }
        }

        try {
            const updatedUser = await this.userModel
                .findByIdAndUpdate(userId, userData, { new: true })
                .exec();

            if (!updatedUser) {
                throw new NotFoundException('User not found');
            }

            return updatedUser;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictException(
                    'User with this name already exists',
                );
            }
            throw new InternalServerErrorException('An error occurred');
        }
    }

    async searchUsers(
        filters: { generalSearchString?: string; role?: string },
        pagination: {
            page: number;
            itemsPerPage: number;
            isFiltered: boolean;
            isPaginated: boolean;
        },
        userSession: UserSession,
    ) {
        const viewerIsSuper = hasPerm(
            'settings:the_super_admin',
            userSession.permissions,
        );
        const viewerCanViewPassword =
            viewerIsSuper ||
            hasPerm('admin:edit_user', userSession.permissions);

        const { page, itemsPerPage, isFiltered, isPaginated } = pagination;
        const { generalSearchString, role } = filters;

        interface SearchQuery {
            role_id?: any; // mongoose ObjectId or value convertible
            $or?: { [key: string]: { $regex: string; $options: string } }[];
        }

        const searchQuery: SearchQuery = {};

        const sortQuery: Record<string, 1 | -1> = {
            createdAt: -1,
        };
        if (isFiltered && !generalSearchString && !role) {
            throw new BadRequestException('No filter applied');
        }
        // Apply role filter if provided
        if (role) {
            // Accept both raw ObjectId string or role name; if it's not a 24-char hex, attempt match by role name via subquery
            if (/^[a-fA-F0-9]{24}$/.test(role)) {
                searchQuery.role_id = role as any;
            } else {
                // Lookup role by name once
                const matchedRole = await this.roleModel
                    .findOne({ name: role })
                    .select('_id')
                    .lean()
                    .exec();
                if (matchedRole) {
                    searchQuery.role_id = matchedRole._id;
                } else {
                    // If role name doesn't exist, return empty result quickly
                    return {
                        pagination: { count: 0, pageCount: 0 },
                        items: [],
                    };
                }
            }
        }

        const skip = (page - 1) * itemsPerPage;

        if (generalSearchString) {
            searchQuery['$or'] = [
                { real_name: { $regex: generalSearchString, $options: 'i' } },
                { name: { $regex: generalSearchString, $options: 'i' } },
            ];
        }

        // Build aggregate-based count if we need to filter super-admin users
        let count: number;
        if (isPaginated) {
            const countPipeline: any[] = [
                { $match: searchQuery },
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'role_id',
                        foreignField: '_id',
                        as: 'role',
                    },
                },
                { $unwind: '$role' },
            ];
            if (!viewerIsSuper) {
                countPipeline.push({
                    $match: {
                        'role.permissions': {
                            $not: { $in: ['settings:the_super_admin'] },
                        },
                    },
                });
            }
            countPipeline.push({ $count: 'count' });
            const counted = await this.userModel.aggregate(countPipeline);
            count = counted[0]?.count || 0;
        } else {
            // Fallback count
            count = await this.userModel.countDocuments(searchQuery).exec();
        }

        let users: User[];
        if (isPaginated) {
            const pipeline: any[] = [
                { $match: searchQuery },
                { $sort: sortQuery },
                { $skip: skip },
                { $limit: itemsPerPage },
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'role_id',
                        foreignField: '_id',
                        as: 'role',
                    },
                },
                { $unwind: '$role' },
            ];
            if (!viewerIsSuper) {
                pipeline.push({
                    $match: {
                        'role.permissions': {
                            $not: { $in: ['settings:the_super_admin'] },
                        },
                    },
                });
            }
            users = await this.userModel.aggregate(pipeline);
        } else {
            users = await this.userModel
                .find(searchQuery)
                .populate('role_id', 'name description permissions')
                .lean()
                .exec();
            if (!viewerIsSuper) {
                users = users.filter(
                    (u: any) =>
                        !(u?.role_id?.permissions || []).includes(
                            'settings:the_super_admin',
                        ),
                );
            }
        }

        const pageCount: number = Math.ceil(count / itemsPerPage);

        if (!users) {
            throw new BadRequestException('Unable to retrieve users');
        }

        // Never leak raw passwords to non-super-admins
        const safeItems = users.map((u: User) => {
            if (!viewerCanViewPassword) {
                if ('password' in u) {
                    // mask but keep shape
                    return { ...u, password: '******' };
                }
            }
            return u;
        });

        return {
            pagination: {
                count,
                pageCount,
            },
            items: safeItems,
        };
    }

    async getUserById(userId: string, userSession: UserSession) {
        const viewerIsSuper = hasPerm(
            'settings:the_super_admin',
            userSession.permissions,
        );
        const viewerCanViewPassword =
            viewerIsSuper ||
            hasPerm('admin:edit_user', userSession.permissions);

        const user = await this.userModel
            .findById(userId)
            .populate('role_id', 'name permissions')
            .lean<PopulatedUser>()
            .exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const targetPerms = this.sanitizePermissions(user.role_id?.permissions);
        const targetIsSuper = hasPerm('settings:the_super_admin', targetPerms);
        if (targetIsSuper && !viewerIsSuper) {
            throw new ForbiddenException('You cannot view this user');
        }

        // Mask password if not allowed
        if (!viewerCanViewPassword && 'password' in user) {
            user.password = '******';
        }

        return user;
    }
}
