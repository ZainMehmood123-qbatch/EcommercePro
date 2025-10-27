import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { ProductVariant } from '@/types/product';

interface Params {
  id: string;
}

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const body: Partial<ProductVariant> = await req.json();

    const updatedVariant = await prisma.productVariant.update({
      where: { id: params.id },
      data: {
        colorName: body.colorName,
        colorCode: body.colorCode,
        size: body.size,
        stock: body.stock,
        price: body.price,
        image: body.image
      }
    });

    return NextResponse.json(
      { success: true, data: updatedVariant },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating variant:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update variant' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    await prisma.productVariant.update({
      where: { id: params.id },
      data: { isDeleted: true }
    });

   return NextResponse.json(
      { success: true, message: 'Variant marked as deleted'},
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting variant:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Variant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}