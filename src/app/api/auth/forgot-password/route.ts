import { NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';

import { sendMail } from '@/lib/mailer';

import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'If this email exists, a reset link was sent.' });
    }

    const token = jwt.sign({ email, version: user.resetTokenVersion }, process.env.JWT_SECRET!, {
      expiresIn: '10m'
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    await sendMail(
      email,
      'Password Reset Request',
      `<p>You requested to reset your password.</p>
       <p>Click <a href='${resetLink}'>here</a> to reset your password.</p>
       <p>This link will expire in 10 minutes.</p>`
    );

    return NextResponse.json({ message: 'Password reset email sent!' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  } catch (err) {
    return NextResponse.json({ err: 'Something went wrong' }, { status: 500 });
  }
}
