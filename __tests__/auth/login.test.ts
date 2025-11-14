/* eslint-disable no-undef */
import bcrypt from 'bcryptjs';

import type { AdapterUser } from 'next-auth/adapters';
import type { User, Account } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

import { getOrCreateStripeCustomer } from '@/lib/stripeCustomer';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

describe('NextAuth - Credentials & Google Provider', () => {
  const mockUser: User = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('❌ should return null if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const credentials = {
      email: 'notfound@example.com',
      password: '123',
      remember: 'false'
    };

    const provider = authOptions.providers.find((p) => p.name === 'Credentials');

    if (!provider || !('authorize' in provider)) {
      throw new Error('Credentials provider not found');
    }

    const user = await provider.authorize(credentials, {
      body: {},
      query: {},
      headers: {},
      method: 'POST'
    });

    expect(user).toBeNull();
  });

  it('❌ should return null if password invalid', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUser,
      password: 'hashedPassword'
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const credentials = {
      email: 'test@example.com',
      password: 'wrong',
      remember: 'false'
    };

    const provider = authOptions.providers.find((p) => p.name === 'Credentials');

    if (!provider || !('authorize' in provider)) {
      throw new Error('Credentials provider not found');
    }

    const user = await provider.authorize(credentials, {
      body: {},
      query: {},
      headers: {},
      method: 'POST'
    });

    expect(user).toBeNull();
  });

  it('✅ should create a new user on Google sign-in if not exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
    (getOrCreateStripeCustomer as jest.Mock).mockResolvedValue('stripe-123');

    const signInCb = authOptions.callbacks?.signIn;

    if (!signInCb) throw new Error('signIn callback missing');

    const user: User = { ...mockUser };
    const account: Account = {
      provider: 'google',
      type: 'oauth',
      providerAccountId: '123'
    };

    const result = await signInCb({ user, account });

    expect(result).toBe(true);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(getOrCreateStripeCustomer).toHaveBeenCalledWith(mockUser.id, mockUser.email);
  });

  it('✅ should populate jwt correctly on signIn', async () => {
    const jwtCb = authOptions.callbacks?.jwt;

    if (!jwtCb) throw new Error('jwt callback missing');

    const token: JWT = {
      id: '',
      name: '',
      email: '',
      role: 'USER',
      exp: 0,
      maxAge: 0
    };

    const user: User = { ...mockUser, remember: true };

    const result = await jwtCb({
      token,
      user,
      trigger: 'signIn',
      account: {
        provider: 'credentials',
        type: 'credentials',
        providerAccountId: 'cred'
      }
    });

    expect(result).toMatchObject({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      exp: expect.any(Number),
      maxAge: expect.any(Number)
    });
  });

  it('✅ should return session with user details', async () => {
    const sessionCb = authOptions.callbacks?.session;

    if (!sessionCb) throw new Error('session callback missing');

    const mockToken: JWT = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      exp: Math.floor(Date.now() / 1000) + 60,
      maxAge: 60
    };

    const session = await sessionCb({
      session: { user: mockUser, expires: '' },
      token: mockToken,
      user: mockUser as AdapterUser,
      newSession: undefined,
      trigger: 'update'
    });

    expect(session.user).toEqual({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER'
    });
    expect(typeof session.expires).toBe('string');
  });
});
