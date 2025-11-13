import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import { encode as jwtEncode, decode as jwtDecode, JWT } from 'next-auth/jwt';

import { prisma } from '@/lib/prisma';
import { getOrCreateStripeCustomer } from '@/lib/stripeCustomer';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) throw new Error('NEXTAUTH_SECRET is not defined');

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  secret: JWT_SECRET,
  jwt: {
    async encode({ token, secret, maxAge }) {
      if (!token) return '';
      const maxAgeNew = token.exp ? (token.exp as number) - Math.floor(Date.now() / 1000) : maxAge;

      return jwtEncode({ token, secret, maxAge: maxAgeNew });
    },
    async decode({ token, secret }) {
      return jwtDecode({ token, secret });
    }
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember', type: 'text' }
      },
      async authorize(credentials): Promise<User> {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Please provide both email and password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error('Invalid email or password.');
        }

        if (!user.password) {
          throw new Error('Please enter your password.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password.');
        }

        return {
          id: user.id,
          name: user.fullname,
          email: user.email,
          role: user.role as 'ADMIN' | 'USER',
          remember: credentials.remember === 'true'
        };
      }
    })
  ],

  pages: { signIn: '/auth/login', error: '/auth/login' },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (existingUser) {
          if (existingUser.password && existingUser.password !== '') {
            throw new Error('Please login using your email and password.');
          }

          await getOrCreateStripeCustomer(existingUser.id, existingUser.email);

          user.id = existingUser.id;
          user.role = existingUser.role as 'ADMIN' | 'USER';

          return true;
        }

        const newUser = await prisma.user.create({
          data: {
            fullname: user.name ?? 'No Name',
            email: user.email,
            password: '',
            role: 'USER'
          }
        });

        await getOrCreateStripeCustomer(newUser.id, newUser.email);
        user.id = newUser.id;
        user.role = newUser.role as 'ADMIN' | 'USER';

        return true;
      }

      return true;
    },

    async jwt({ token, user, trigger, account }): Promise<JWT> {
      if (trigger === 'signIn' && user) {
        const now = Math.floor(Date.now() / 1000);
        let maxAge: number;

        if (account?.provider === 'credentials' || account?.provider === 'google') {
          const remember = user.remember ?? false;

          maxAge = remember ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
        } else {
          maxAge = 30 * 24 * 60 * 60;
        }

        const exp = now + maxAge;

        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.exp = exp;
        token.maxAge = maxAge;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        const now = Math.floor(Date.now() / 1000);
        const tokenExp = token.exp as number;
        const remaining = tokenExp - now;

        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as 'ADMIN' | 'USER'
        };

        session.expires = new Date(tokenExp * 1000).toISOString();
        if (remaining <= 0) {
          return {
            ...session,
            expires: new Date(0).toISOString()
          };
        }
      }

      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
