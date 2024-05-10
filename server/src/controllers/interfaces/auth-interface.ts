import { AuthInfo } from '../../models';

export interface IAuthController {
  getAuthorization(): Promise<AuthInfo>;
  getAdminRoles(): Promise<string[]>;
  getEventRoles(): Promise<string[]>;
}
