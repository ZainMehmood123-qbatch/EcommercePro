import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    return NextResponse.json({ success: true, data: updatedVariant });
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    await prisma.productVariant.update({
      where: { id: params.id },
      data: { isDeleted: true }
    });

    return NextResponse.json({ success: true, message: 'Variant deleted' });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
  }
}