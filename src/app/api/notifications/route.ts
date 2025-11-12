import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/prisma';

import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return NextResponse.json({ success: true, data: notifications });
}
