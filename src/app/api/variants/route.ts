import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ProductVariant } from '@/types/product';

export async function POST(req: Request) {
  try {
    const body: ProductVariant & { productId: string } = await req.json();

    const newVariant = await prisma.productVariant.create({
      data: {
        productId: body.productId,
        colorName: body.colorName,
        colorCode: body.colorCode,
        size: body.size,
        stock: body.stock,
        price: body.price,
        image: body.image
      }
    });

    return NextResponse.json({ success: true, data: newVariant }, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
  }
}
