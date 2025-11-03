import { NextResponse } from 'next/server';

import { Prisma, ProductStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        title: body.title,
        status: ProductStatus.ACTIVE
      },
      include: { variants: { where: { isDeleted: false } } }
    });

    return NextResponse.json({ success: true, data: updatedProduct }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.update({
      where: { id: params.id },
      data: { status: ProductStatus.INACTIVE }
    });

    return NextResponse.json(
      { success: true, message: 'Product marked as inactive' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
