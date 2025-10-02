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

    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items to create order' },
        { status: 400 }
      );
    }

    let subtotal = 0;

    const itemsWithValidIds = await Promise.all(
      items.map(async (item: OrderItemInput) => {
        if (!item.productId) {
          throw new Error('Missing productId in order item');
        }

        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(
            `Product not found: ${item.title ?? ''} ${item.colorName ?? ''} ${item.size ?? ''}`
          );
        }

        if (product.stock < item.qty) {
          throw new Error(
            `Not enough stock for ${product.title}. Available: ${product.stock}, Requested: ${item.qty}`
          );
        }

        const price = product.price;
        subtotal += price * item.qty;

        return {
          productId: product.id,
          qty: item.qty,
          price,
          colorName: item.colorName ?? null,
          colorCode: item.colorCode ?? null,
          size: item.size ?? null
        };
      })
    );

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          tax,
          total,
          items: {
            create: itemsWithValidIds
          }
        },
        include: {
          items: true
        }
      });

      // Decrement stock
      await Promise.all(
        itemsWithValidIds.map((item) =>
          tx.product.update({
            where: { id: item.productId },
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
