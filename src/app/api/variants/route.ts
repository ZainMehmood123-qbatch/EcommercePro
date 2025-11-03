import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import type { ProductVariant } from '@/types/product';

export async function POST(req: Request) {
  try {
    const body: ProductVariant & { productId: string } = await req.json();

    if (
      !body.productId ||
      !body.colorName ||
      !body.colorCode ||
      !body.size ||
      body.price === undefined
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            message: 'Variant with same color and size already exists for this product.'
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create variant' },
      { status: 500 }
    );
  }
}
