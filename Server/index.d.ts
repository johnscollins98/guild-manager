import 'passport-discord';

declare global {
  namespace Express {
    export interface User {
      _id: ObjectID;
      id: string;
      username: string;
      accessToken;
    }
  }
}
