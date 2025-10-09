
import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

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
          role: user.role as 'ADMIN' | 'USER'
        };
      }
    })
  ],

  pages: {
    signIn: '/auth/login'
  },

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

        user.id = existingUser.id;
        user.role = existingUser.role as 'ADMIN' | 'USER';
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? '';
        token.email = user.email ?? '';
        token.role = user.role;

        if (account?.provider === 'credentials') {
          const remember =
            (account as { provider: 'credentials'; remember?: string })
              ?.remember === 'true';

          token.expires =
            Math.floor(Date.now() / 1000) +
            (remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24);
        } else {
          token.expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
        }
      }

      // token expiry check
      if (token.expires && Date.now() / 1000 > token.expires) {
        token.expires = 0;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.expires || Date.now() / 1000 > token.expires) {
        return null;
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
