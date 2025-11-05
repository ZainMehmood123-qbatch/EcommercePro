import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { Prisma, ProductStatus, Role } from '@prisma/client';

import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/prisma';
import type { ProductType, ProductVariant } from '@/types/product';

import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role || 'USER';

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '8', 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') ?? '';
    const sort = searchParams.get('sort') ?? 'newest';

    let orderBy: Prisma.ProductOrderByWithRelationInput;

    switch (sort) {
      case 'name_asc':
        orderBy = { title: 'asc' };
        break;
      case 'name_desc':
        orderBy = { title: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const baseWhere: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      ...(search
        ? {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        : {})
    };

    const where: Prisma.ProductWhereInput =
      role === Role.ADMIN
        ? baseWhere
        : {
            ...baseWhere,
            variants: { some: { isDeleted: false } }
          };

    const include =
      role === Role.ADMIN ? { variants: true } : { variants: { where: { isDeleted: false } } };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({ success: true, data: products, total }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Fetch products error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, message: 'Database query failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== Role.ADMIN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body: ProductType = await req.json();

    const newProduct = await prisma.product.create({
      data: {
        title: body.title,
        status: ProductStatus.ACTIVE,
        variants: {
          create: (body.variants ?? []).map((v: ProductVariant) => ({
            colorName: v.colorName,
            colorCode: v.colorCode,
            size: v.size,
            stock: v.stock,
            price: v.price,
            image: v.image
          }))
        }
      },
      include: { variants: true }
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            message: 'Duplicate variant: same color and size already exist for this product.'
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Database error occurred' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
