import { POST } from '@/app/api/auth/reset-password/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


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
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

describe('POST /api/auth/reset-password', () => {
  type ResetPasswordBody = {
    token: string;
    password: string;
  };

  const validBody: ResetPasswordBody = {
    token: 'valid.token',
    password: 'Password@1'
  };

  const mockRequest = (body: ResetPasswordBody) =>
    new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body)
    });

  beforeEach(() => jest.clearAllMocks());

  it('should update password successfully', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'john@example.com', version: 1 });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'john@example.com', resetTokenVersion: 1 });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Password updated successfully');
  });

  it('should return 400 for invalid token', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid or expired token');
  });

  it('should return 400 if user not found', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'john@example.com', version: 1 });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('User not found');
  });

  it('should return 400 if token already used', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ email: 'john@example.com', version: 1 });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ resetTokenVersion: 2 });

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('This token has already been used');
  });

  it('should return 400 for Joi validation error', async () => {
    const res = await POST(mockRequest({ token: '', password: '' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
