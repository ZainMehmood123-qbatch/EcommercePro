import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params; 

  try {
    const session = await getServerSession({ req, ...authOptions });

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        total: true,
        tax: true,
        createdAt: true,
        userId: true,
        user: { select: { fullname: true } },
        items: {
          select: {
            qty: true,
            price: true,
            product: {
              select: {
                title: true
              }
            },
            variant: { 
              select: {
                colorName: true,
                colorCode: true,
                size: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    if (session.user.role !== 'ADMIN' && order.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const formattedOrder = {
      ...order,
      items: order.items.map(item => ({
        qty: item.qty,
        price: item.price,
        product: item.product,
        colorName: item.variant?.colorName ?? null,
        colorCode: item.variant?.colorCode ?? null,
        size: item.variant?.size ?? null,
        image: item.variant?.image ?? null
      }))
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Order fetch failed:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
