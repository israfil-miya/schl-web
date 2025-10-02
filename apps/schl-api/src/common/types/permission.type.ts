import { permissions } from 'src/common/constants/permission.constant';
export type Permissions = (typeof permissions)[number]['value'];
