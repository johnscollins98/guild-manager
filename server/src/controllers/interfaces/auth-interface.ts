import { AuthInfo } from '../../dtos';

export interface IAuthController {
  getAuthorization(): Promise<AuthInfo>;
  getAdminRoles(): Promise<string[]>;
  getEventRoles(): Promise<string[]>;
}
