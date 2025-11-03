import bcrypt from 'bcryptjs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// Joi schema for validation
const schema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 6 characters, include uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    })
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate with Joi
    const { error, value } = schema.validate(body);

    if (error) {
      const { details } = error || {};
      const [{ message }] = details || [];

      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    const { token, password } = value;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { email: string, version: number };

    if (!decoded?.email) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
  where: { email: decoded.email },
  select: { id: true, resetTokenVersion: true }
});

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    console.log('Version is = ',decoded.version);
  
    if (decoded.version !== user.resetTokenVersion) {
      return NextResponse.json({ error: 'This token has already been used' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: decoded.email },
      data: {
          password: hashedPassword,
          resetTokenVersion: { increment: 1 } 
        }
      });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    );
  }
}
