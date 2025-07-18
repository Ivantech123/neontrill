import 'express-session';

declare module 'express-session' {
  interface SessionData {
    serverSeed: string;
    nonce: number;
  }
}
