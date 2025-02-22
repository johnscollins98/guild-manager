import { AuthInfo } from '../../dtos';

export interface IAuthController {
  getAuthorization(): Promise<AuthInfo>;
  getEventRoles(): Promise<string[]>;
}
