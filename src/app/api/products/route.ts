import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { Product, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page: number = parseInt(searchParams.get('page') || '1', 10);
    const limit: number = parseInt(searchParams.get('limit') || '8', 10);
    const skip: number = (page - 1) * limit;
    const search: string = searchParams.get('search') || '';
    const sort: string = searchParams.get('sort') || 'newest';

    let orderBy: Record<string, 'asc' | 'desc'>;
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
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

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      ...(search
        ? {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          }
        : {})
    };

    const products: Product[] = await prisma.product.findMany({
      skip,
      take: limit,
      where,
      orderBy
    });

    const total: number = await prisma.product.count({ where });

    return NextResponse.json({ data: products, total });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newProduct = await prisma.product.create({
      data: {
        title: body.title,
        price: body.price,
        stock: body.stock ?? 0,
        image: body.image ?? '',
        size: body.size ?? 'L',
        colorName: body.colorName ?? 'white',
        colorCode: body.colorCode ?? '#FFFFFF'
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
