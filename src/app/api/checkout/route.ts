import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
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
    const { items, total } = body as { items: CartItem[]; total: number };

    if (!items?.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

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

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        stripeCustomerId: customerId,
        total,
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.id,
            variantId: item.variantId,
            qty: item.qty,
            price: item.price
          }))
        }
      }
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product,
          images: [
            item.image.startsWith('http')
              ? item.image
              : `${process.env.NEXT_PUBLIC_BASE_URL}${item.image}`
          ],
          metadata: {
            productId: item.id,
            variantId: item.variantId ?? '',
            colorName: item.colorName ?? '',
            colorCode: item.colorCode ?? '',
            size: item.size ?? ''
          }
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.qty
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
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

    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
