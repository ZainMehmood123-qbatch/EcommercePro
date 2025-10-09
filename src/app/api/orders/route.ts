import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { OrderItemInput } from '@/types/order';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    let whereClause: Prisma.OrderWhereInput = {};

    if (role === 'ADMIN') {
      if (search) {
        whereClause = {
          OR: [
            { id: { contains: search.replace('ORD-', ''), mode: 'insensitive' } },
            { userId: { contains: search.replace('USR-', ''), mode: 'insensitive' } }
          ]
        };
      }
    } else {
      whereClause = { userId };
      if (search) {
        whereClause = {
          AND: [
            { userId },
            { id: { contains: search.replace('ORD-', ''), mode: 'insensitive' } }
          ]
        };
      }
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: true,
          user: { select: { id: true, fullname: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ]);

    const totalUnits = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0),
      0
    );

    const totalAmount = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.qty, 0),
      0
    );

    return NextResponse.json(
      {
        orders,
        totalCount,
        page,
        limit,
        stats: {
          totalOrders: totalCount,
          totalUnits,
          totalAmount
        }
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}



export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { items } = (await req.json()) as { items: OrderItemInput[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items to create order' }, { status: 400 });
    }
    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true }
    });

    if (variants.length !== items.length) {
      return NextResponse.json({ error: 'Some variants not found' }, { status: 400 });
    }

    let subtotal = 0;

    const itemsWithValidatedData = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) throw new Error('Variant not found');

      if (variant.stock < item.qty) {
        throw new Error(
          `Not enough stock for ${variant.product.title} (${variant.colorName ?? ''} ${variant.size ?? ''})`
        );
      }

      const price = variant.price;
      subtotal += price * item.qty;

      return {
        productId: variant.productId,
        variantId: variant.id,
        qty: item.qty,
        price,
        colorName: variant.colorName,
        colorCode: variant.colorCode,
        size: variant.size
      };
    });

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          tax,
          total,
         items: {
  create: itemsWithValidatedData.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    qty: item.qty,
    price: item.price
  }))
}

        },
        include: { items: true }
      });

      // Decrement stock safely
      await Promise.all(
        itemsWithValidatedData.map((item) =>
          tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.qty } }
          })
        )
      );

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('Order creation failed:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
