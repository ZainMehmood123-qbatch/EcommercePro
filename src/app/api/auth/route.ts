import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return new Response(JSON.stringify(products), { status: 200 });
}
