// import { NextResponse } from 'next/server';

// import { prisma } from '@/lib/prisma';
// // Update product
// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const body = await req.json();

//     const updatedProduct = await prisma.product.update({
//       where: { id: params.id },
//       data: {
//         title: body.title,
//         price: body.price,
//         stock: body.stock ?? 0,
//         image: body.image ?? '',
//          size: body.size ?? 'L',
//         colorName: body.colorName ?? 'white',
//         colorCode: body.colorCode ?? '#FFFFFF'
//       }
//     });

//     return NextResponse.json(updatedProduct);
//   } catch (error) {
//     console.error('Error updating product:', error);
//     return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
//   }
// }

// // Delete product (soft delete)
// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await prisma.product.update({
//       where: { id: params.id },
//       data: { status: 'INACTIVE' } // product ko inactive kar diya
//     });

//     return NextResponse.json({ message: 'Product marked as INACTIVE' });
//   } catch (error) {
//     console.error('Error updating product status:', error);
//     return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
//   }
// }



import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        title: body.title,
        status: body.status ?? 'ACTIVE',
        variants: {
          // existing variants update or new ones add
          upsert: body.variants?.map((v: any) => ({
            where: { id: v.id ?? '' }, // agar id hai to update
            update: {
              colorName: v.colorName,
              colorCode: v.colorCode,
              size: v.size,
              stock: v.stock,
              price: v.price,
              image: v.image
            },
            create: {
              colorName: v.colorName,
              colorCode: v.colorCode,
              size: v.size,
              stock: v.stock,
              price: v.price,
              image: v.image
            }
          }))
        }
      },
      include: { variants: true }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
