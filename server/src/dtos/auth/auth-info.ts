import { PermissionsDTO } from './permissions-dto';

export interface AuthInfo {
  loggedIn: boolean;
  username: string;
  roles: string[];
  permissions: PermissionsDTO;
}
