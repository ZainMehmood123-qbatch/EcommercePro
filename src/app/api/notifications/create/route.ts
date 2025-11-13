import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, message } = await req.json();

    if (!userId || !message) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const notification = await prisma.notification.create({
      data: { userId, message }
    });

    return NextResponse.json(notification);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating notification:', error);

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
