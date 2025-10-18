import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
//import { productUpdateSchema } from '@/validations/productSchema';
import type { ProductType } from '@/types/product';

interface Params {
  id: string;
}

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const body: Partial<ProductType> = await req.json();

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        title: body.title,
        status: 'ACTIVE'
      },
      include: { variants: { where: { isDeleted: false } } }
    });

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' }
    });

    return NextResponse.json({ message: 'Product marked as INACTIVE' });
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
