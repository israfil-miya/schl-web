import { User } from 'src/models/user.schema';
export interface PopulatedUser extends Omit<User, 'role_id'> {
    role_id: {
        name: string;
        permissions: string[];
    };
}
