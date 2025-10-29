import { POST } from '@/app/api/auth/signup/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';


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
      create: jest.fn()
    }
  }
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn()
}));

jest.mock('@/lib/stripeCustomer', () => ({
  getOrCreateStripeCustomer: jest.fn()
}));

describe('POST /api/auth/signup', () => {
  type SignupBody = {
    fullname: string;
    email: string;
    mobile: string;
    password: string;
  };

  const validBody: SignupBody = {
    fullname: 'John Doe',
    email: 'john@example.com',
    mobile: '1234567890',
    password: 'Password@1'
  };

  const mockRequest = (body: SignupBody | Record<string, unknown>) =>
    new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body)
    });

  beforeEach(() => jest.clearAllMocks());

  it('should return 201 on successful signup', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1' });

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.message).toMatch(/Stripe customer linked successfully/);
  });

  it('should return 400 if user already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/already exists/);
  });

  it('should return 400 on Joi validation error', async () => {
    const invalidBody = { ...validBody, email: 'invalid' };
    const res = await POST(mockRequest(invalidBody));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 500 on internal error', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await POST(mockRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('DB error');
  });
});
