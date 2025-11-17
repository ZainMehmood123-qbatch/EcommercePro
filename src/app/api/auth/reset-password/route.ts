import { NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '@/lib/prisma';
import { resetpasswordSchema } from '@/validations/authSchema';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const { error, value } = resetpasswordSchema.validate(body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message
      }));

      return NextResponse.json({ errors }, { status: 400 });
    }

    const { token, password } = value;

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      version: number;
    };

    if (!decoded?.email) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { id: true, resetTokenVersion: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    // Check if token version matches
    if (decoded.version !== user.resetTokenVersion) {
      return NextResponse.json({ error: 'This token has already been used' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password & increment reset token version
    await prisma.user.update({
      where: { email: decoded.email },
      data: {
        password: hashedPassword,
        resetTokenVersion: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid or expired token';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
