// types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    remember?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN' | 'USER';
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    exp: number;
    maxAge: number;
  }
}