import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { encode as jwtEncode, decode as jwtDecode } from 'next-auth/jwt';
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
      const maxAgeNew = token.exp
        ? (token.exp as number) - Math.floor(Date.now() / 1000)
        : maxAge;
      
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
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) return null;

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

  pages: { signIn: '/auth/login' },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              fullname: user.name ?? 'No Name',
              email: user.email,
              password: '',
              role: 'USER'
            }
          });
        }

        await getOrCreateStripeCustomer(existingUser.id, existingUser.email);

        user.id = existingUser.id;
        user.role = existingUser.role as 'ADMIN' | 'USER';
      }
      return true;
    },

    async jwt({ token, user, trigger, account }): Promise<JWT> {
      if (trigger === 'signIn' && user) {
        const now = Math.floor(Date.now() / 1000);
        let maxAge: number;
        
        if (account?.provider === 'credentials') {
          const remember = user.remember ?? false;
          maxAge = remember ? 30 * 24 * 60 * 60 : 2 * 60; 
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