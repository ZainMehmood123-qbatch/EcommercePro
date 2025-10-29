import 'whatwg-fetch';
import '@testing-library/jest-dom';
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}));
jest.mock('@/lib/stripeCustomer', () => ({
  getOrCreateStripeCustomer: jest.fn()
}));
jest.mock('@/lib/mailer', () => ({
  sendMail: jest.fn()
}));
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));
