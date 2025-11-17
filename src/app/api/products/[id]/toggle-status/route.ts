// app/api/products/[id]/toggle-status/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';
import { Role, ProductStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== Role.ADMIN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // 🔥 FIX — unwrap params
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        status:
          product.status === ProductStatus.ACTIVE ? ProductStatus.INACTIVE : ProductStatus.ACTIVE
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.log('TOGGLE ERROR:', error);

    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
