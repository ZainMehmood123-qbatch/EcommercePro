import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';

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

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      ...(search
        ? {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        : {})
    };

    const products = await prisma.product.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include: {
        variants: true 
      }
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({ data: products, total });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
  const newProduct = await prisma.product.create({
  data: {
    title: body.title,
    status: 'ACTIVE',
    variants: {
      create: body.variants?.map((v: {
        colorName: string;
        colorCode: string;
        size: string;
        stock: number;
        price: number;
        image: string;
      }) => ({
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


    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
