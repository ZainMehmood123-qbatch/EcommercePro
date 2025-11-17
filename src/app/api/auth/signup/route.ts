import { NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { getOrCreateStripeCustomer } from '@/lib/stripeCustomer';
import { SignupFormValues } from '@/types/auth';
import { signupSchema } from '@/validations/authSchema';

export async function POST(req: Request) {
  try {
    const body: SignupFormValues = await req.json();

    const { error, value } = signupSchema.validate(body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message
      }));

      return NextResponse.json({ errors }, { status: 400 });
    }

    const { fullname, email, mobile, password } = value;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 409 });
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
