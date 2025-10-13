import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productUpdateSchema } from '@/validations/productSchema';
import type { ProductType, ProductVariant } from '@/types/product';

interface Params {
  id: string;
}

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const body: ProductType = await req.json();

    const { error, value } = productUpdateSchema.validate(body, {
      abortEarly: false
    });
    if (error) {
      return NextResponse.json(
        { success: false, errors: error.details.map((e) => e.message) },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        title: value.title,
        status: 'ACTIVE',
        variants: {
          upsert: value.variants?.map((v: ProductVariant) => {
            const whereClause = v.id
              ? { id: v.id }
              : {
                  productId_colorName_size: {
                    productId: params.id,
                    colorName: v.colorName,
                    size: v.size
                  }
                };

            const variantData = {
              colorName: v.colorName,
              colorCode: v.colorCode,
              size: v.size,
              stock: v.stock,
              price: v.price,
              image: v.image
            };

            return {
              where: whereClause,
              update: variantData,
              create: variantData
            };
          })
        }
      },
      include: { variants: true }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// Delete product (soft delete)
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
