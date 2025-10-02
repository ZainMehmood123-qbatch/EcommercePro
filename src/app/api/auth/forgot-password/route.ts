import jwt from 'jsonwebtoken';

import { NextResponse } from 'next/server';

import { sendMail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    const token = jwt.sign({ email }, process.env.EMAIL_PASS!, {
      expiresIn: '5m' 
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    await sendMail(
      email,
      'Password Reset Request',
      `<p>You requested to reset your password.</p>
       <p>Click <a href='${resetLink}'>here</a> to reset your password.</p>
       <p>This link will expire in 2 minutes.</p>`
    );

    return NextResponse.json({ message: 'Password reset email sent!' });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    console.log(error);
  }
}
