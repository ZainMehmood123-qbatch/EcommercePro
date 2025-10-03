import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'USER';
      email: string;
      name: string;
    } & DefaultSession['user'];
    expires: string;
  }

  interface User extends DefaultUser {
    id: string;
    role: 'ADMIN' | 'USER';
    email: string;
    name: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'USER';
    email: string;
    name: string;
    expires: number;
  }
}
