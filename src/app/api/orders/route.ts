import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { Prisma, Role } from '@prisma/client';

import { prisma } from '@/lib/prisma';
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

    if (role === Role.ADMIN) {
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
          user: { select: { id: true, fullname: true, email: true } },
          items: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ]);

    const allOrdersForStats = await prisma.order.findMany({
      where: whereClause,
      include: { items: { select: { qty: true, price: true } } }
    });

    const totalUnits = allOrdersForStats.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0),
      0
    );

    const totalAmount = allOrdersForStats.reduce(
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


export async function PATCH(req: Request) {
  try {
    const { orderId, paymentStatus } = await req.json();

    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Missing orderId or paymentStatus' },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus }
    });

    return NextResponse.json({
          success: true,
          message: 'Order updated successfully',
          data: updatedOrder
        });
      } catch (error) {
        console.error('Error updating order:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return NextResponse.json(
            { success: false, message: 'Order not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
      }
}