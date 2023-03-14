import 'passport-discord';

declare global {
  namespace Express {
    export interface User {
      id: string;
      username: string;
      accessToken: string;
      expires: Date;
    }
  }
}
