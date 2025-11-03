import { NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';
import Joi from 'joi';

import { prisma } from '@/lib/prisma';
import { getOrCreateStripeCustomer } from '@/lib/stripeCustomer';
import { SignupFormValues } from '@/types/auth';

const signupSchema = Joi.object<SignupFormValues>({
  fullname: Joi.string()
    .pattern(/^[a-zA-Z ]+$/)
    .required()
    .messages({
      'string.empty': 'Please enter your full name',
      'string.pattern.base': 'Full name can only contain letters and spaces'
    }),
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      'string.empty': 'Please enter your email',
      'string.pattern.base': 'Enter a valid email format (e.g. user@example.com)'
    }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Enter a valid mobile number (10-15 digits)'
    }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
    .required()
    .messages({
      'string.empty': 'Please enter your password',
      'string.pattern.base':
        'Password must be at least 6 characters, include uppercase, lowercase, number, and special character'
    })
});

export async function POST(req: Request) {
  try {
    const body: SignupFormValues = await req.json();
    const { error, value } = signupSchema.validate(body);

    if (error) {
      return NextResponse.json({ error: error.details[0].message }, { status: 400 });
    }

    const { fullname, email, mobile, password } = value;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullname,
        email,
        mobile,
        password: hashedPassword
      }
    });

    await getOrCreateStripeCustomer(newUser.id, email);

    return NextResponse.json(
      {
        message: 'Your account has been created. Stripe customer linked successfully.'
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
