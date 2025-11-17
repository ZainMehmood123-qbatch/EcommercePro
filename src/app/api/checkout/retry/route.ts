// /api/checkout/retry/route.ts
import { NextRequest, NextResponse } from 'next/server';

import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { PaymentStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { authOptions } from '../../auth/[...nextauth]/route';

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
    const { orderId } = body as { orderId: string };

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized for this order' }, { status: 403 });
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      return NextResponse.json({ error: 'Order is not pending', status: 400 });
    }

    if (!order.stripeSessionId) {
      return NextResponse.json(
        { error: 'No Stripe session found for this order' },
        { status: 400 }
      );
    }

    // Retrieve existing Stripe session
    const existingSession = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

    // If session is unpaid, reuse URL
    if (existingSession.payment_status === 'unpaid') {
      return NextResponse.json({ url: existingSession.url }, { status: 200 });
    }

    // Create or fetch tax rate (10%)
    const taxRate = await stripe.taxRates.create({
      display_name: 'Sales Tax',
      percentage: 10,
      inclusive: false
    });

    // Stripe line_items me tax add karo
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.product.title} — ${item.variant?.colorName || ''} ${item.variant?.size || ''}`,
          description: `Qty: ${item.qty} • Price: $${item.price}`,
          metadata: {
            productId: item.productId,
            variantId: item.variantId ?? '',
            colorName: item.variant?.colorName ?? '',
            size: item.variant?.size ?? ''
          }
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.qty,
      tax_rates: [taxRate.id]
    }));

    const newSession = await stripe.checkout.sessions.create({
      customer: order.stripeCustomerId ?? undefined,
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

    // Update order with new Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: newSession.id }
    });

    return NextResponse.json({ url: newSession.url }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
