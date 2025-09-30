import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
//import { PrismaClient } from '@prisma/client';
import NextAuth, { AuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';
//const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

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
          role: user.role as 'ADMIN' | 'USER'
        };
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;

        const remember =
          (account as { remember?: string })?.remember === 'true';
        token.expires =
          Math.floor(Date.now() / 1000) +
          (remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24);
      }

      if (token.expires && Date.now() / 1000 > token.expires) {
        token.expires = 0;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.expires || Date.now() / 1000 > token.expires) {
        return null as any; // invalidate expired session
      }

      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role
      };
      session.expires = new Date(token.expires * 1000).toISOString();

      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
