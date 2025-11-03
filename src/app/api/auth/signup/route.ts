import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getOrCreateStripeCustomer } from '@/lib/stripeCustomer';
import { SignupFormValues } from '@/types/auth';

// yeh mene middleware mei kr lia hai. isko yahan sy baad mei hata lunga ... 
const signupSchema = Joi.object<SignupFormValues>({});

export async function POST(req: Request) {
  try {
    const body: SignupFormValues = await req.json();
    const { error, value } = signupSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );
    }

    const { fullname, email, mobile, password } = value;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
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
        message:
          'Your account has been created. Stripe customer linked successfully.'
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Signup Error:', err);
    const message = err instanceof Error ? err.message : 'Something went wrong';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
