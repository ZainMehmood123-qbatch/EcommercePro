import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import type { CreateOrderRequest, OrderItemInput } from '@/types/order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateOrderRequest = await req.json();
    const { items, total } = body;
    console.log(total);

    if (!items?.length) {
      return NextResponse.json({ error: 'No items found' }, { status: 400 });
    }

    // Convert to Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: OrderItemInput) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.title}${item.size ? ` (${item.size})` : ''}`,
            images: item.image ? [item.image] : []
          },
          unit_amount: Math.round(item.price * 100) // cents
        },
        quantity: item.qty
      })
    );

    // Create Stripe session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id
        // you can later add: orderId: 'xyz'
      }
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error occurred';
    console.error('Stripe checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
