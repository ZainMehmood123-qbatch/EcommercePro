import bcrypt from 'bcryptjs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// yeh mene middleware mei kr lia hai. isko yahan sy baad mei hata lunga ... 
const schema = Joi.object({});

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

    const user = await prisma.user.findUnique({ where: { email: decoded.email } });
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

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    );
  }
}
