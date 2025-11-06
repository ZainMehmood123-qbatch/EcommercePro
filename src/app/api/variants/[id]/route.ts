import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import type { ProductVariant } from '@/types/product';

// export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'Variant ID is required' },
//         { status: 400 }
//       );
//     }

//     const body: Partial<ProductVariant> = await req.json();

//     const updatedVariant = await prisma.productVariant.update({
//       where: { id },
//       data: {
//         colorName: body.colorName,
//         colorCode: body.colorCode,
//         size: body.size,
//         stock: body.stock,
//         price: body.price,
//         image: body.image,
//         isDeleted: body.isDeleted
//       }
//     });

//     return NextResponse.json({ success: true, data: updatedVariant }, { status: 200 });
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return NextResponse.json({ success: false, message: 'Variant not found' }, { status: 404 });
//     }

//     return NextResponse.json(
//       { success: false, message: 'Failed to update variant' },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Variant ID is required' },
        { status: 400 }
      );
    }

    const body: Partial<ProductVariant> = await req.json();

    const updatedVariant = await prisma.productVariant.update({
      where: { id },
      data: {
        colorName: body.colorName,
        colorCode: body.colorCode,
        size: body.size,
        stock: body.stock,
        price: body.price,
        image: body.image,
        isDeleted: body.isDeleted
      }
    });

    return NextResponse.json({ success: true, data: updatedVariant }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ success: false, message: 'Variant not found' }, { status: 404 });
      }

      if (error.code === 'P2002') {
        // Prisma duplicate constraint violation
        return NextResponse.json(
          { success: false, message: 'Variant already exists' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update variant' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Variant ID is required' },
        { status: 400 }
      );
    }

    await prisma.productVariant.update({
      where: { id },
      data: { isDeleted: true }
    });

    return NextResponse.json(
      { success: true, message: 'Variant marked as deleted' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Variant not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, message: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}
