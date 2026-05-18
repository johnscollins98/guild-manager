import 'passport-discord';

declare global {
  namespace Express {
    export interface User {
      id: string;
      username: string;
      expires: Date;
    }
  }
}

// types/express-session.d.ts
import 'express-session';
declare module 'express-session' {
  interface SessionData {
    returnTo?: string;
  }
}
