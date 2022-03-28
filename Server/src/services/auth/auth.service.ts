import { Service } from 'typedi';
import AuthInfo from '../../models/interfaces/authinfo.interface';

const notLoggedIn = {
  loggedIn: false,
  isAdmin: false,
  username: ''
};

@Service()
export class AuthService {
  constructor() {}

  async getUserAuthInfo(user?: Express.User): Promise<AuthInfo> {
    if (!user) return notLoggedIn;
    const loggedIn = true;
    const isAdmin = user.isAdmin;
    const username = user.username;

    return { loggedIn, isAdmin, username };
  }
}
