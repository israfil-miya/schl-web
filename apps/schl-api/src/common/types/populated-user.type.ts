import { type Permissions } from 'src/common/types/permission.type';
import { User } from 'src/models/user.schema';
export interface PopulatedByEmployeeUser extends Omit<User, 'employee'> {
    employee: {
        _id: string;
        e_id: string;
        real_name: string;
        company_provided_name: string;
    };
}

export interface PopulatedByRoleUser extends Omit<User, 'role'> {
    role: {
        _id: string;
        name: string;
        permissions: Permissions[];
    };
}

export interface FullyPopulatedUser
    extends Omit<User, 'employee' | 'role'>,
        Pick<PopulatedByEmployeeUser, 'employee'>,
        Pick<PopulatedByRoleUser, 'role'> {}
