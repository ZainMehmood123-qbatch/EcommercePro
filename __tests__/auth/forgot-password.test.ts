import jwt from 'jsonwebtoken';

import { POST } from '@/app/api/auth/forgot-password/route';
import { prisma } from '@/lib/prisma';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  jest.restoreAllMocks();
});

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock('@/lib/mailer', () => ({
  sendMail: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

describe('POST /api/auth/forgot-password', () => {
  const validBody = { email: 'john@example.com' };

  const mockRequest = (body: { email: string }) =>
    new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body)
    });

  beforeEach(() => jest.clearAllMocks());

  it('should send reset link for existing user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'john@example.com',
      resetTokenVersion: 1
    });
    (jwt.sign as jest.Mock).mockReturnValue('token');

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Password reset email sent!');
  });

  it('should return generic message for non-existent user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toMatch(/If this email exists/);
  });

  it('should return 500 on internal error', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Something went wrong');
  });
});
