import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

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
            {
              user: {
                fullname: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          ]
        };
      }
    } else {
      whereClause = { userId };
      if (search) {
        whereClause = {
          AND: [{ userId }, { id: { contains: search.replace('ORD-', ''), mode: 'insensitive' } }]
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
    const summary = await prisma.orderSummary.findFirst();

    return NextResponse.json(
      {
        orders,
        totalCount,
        page,
        limit,
        stats: {
          totalOrders: summary?.totalOrders || 0,
          totalUnits: summary?.totalUnits || 0,
          totalAmount: summary?.totalAmount || 0
        }
      },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { orderId, paymentStatus } = await req.json();

    if (!orderId || !paymentStatus) {
      return NextResponse.json({ error: 'Missing orderId or paymentStatus' }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus }
    });

    if (paymentStatus === 'COMPLETED') {
      await prisma.notification.create({
        data: {
          userId: existingOrder.userId,
          message: `Your order with OrderID ${existingOrder.id.slice(0, 6)} has been marked as Completed by the admin.`
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Order update error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
