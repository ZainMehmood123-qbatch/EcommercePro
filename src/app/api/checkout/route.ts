import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
//import { createOrderSchema } from '@/validations/orderSchema';
import type { CartItem } from '@/types/cart';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Incoming order body:', JSON.stringify(body, null, 2));

    const { items, total } = body as { items: CartItem[]; total: number };
    if (!items?.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // const { error } = createOrderSchema.validate({ items }, { abortEarly: false });
    // if (error) {
    //   return NextResponse.json(
    //     { error: 'Validation failed', details: error.details.map((d) => d.message) },
    //     { status: 400 }
    //   );
    // }

    const variantIds = items.map((i) => i.variantId);
    const duplicates = variantIds.filter((id, index) => variantIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: `Duplicate variants not allowed: ${[...new Set(duplicates)].join(', ')}` },
        { status: 400 }
      );
    }

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
    const calculatedTotal = subtotal + tax;

    if (Math.abs(calculatedTotal - total) > 0.01) {
      return NextResponse.json({ error: 'Total mismatch detected' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id }
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id }
      });

      customerId = customer.id;
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          stripeCustomerId: customerId!,
          tax,
          total: calculatedTotal,
          paymentStatus: 'PENDING',
          items: {
            create: itemsWithValidatedData.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              qty: item.qty,
              price: item.price
            }))
          }
        }
      });

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

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = itemsWithValidatedData.map(
      (item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.colorName ?? ''} ${item.size ?? ''}`.trim() || 'Product',
            metadata: {
              productId: item.productId,
              variantId: item.variantId,
              colorName: item.colorName ?? '',
              size: item.size ?? ''
            }
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.qty
      })
    );

    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId!,
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      line_items,
      metadata: {
        userId: session.user.id,
        orderId: order.id
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id }
    });

    return NextResponse.json({ url: stripeSession.url }, { status: 200 });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
