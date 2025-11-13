import { NextRequest, NextResponse } from 'next/server';

import Stripe from 'stripe';

import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
});

export const config = {
  api: { bodyParser: false }
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        return NextResponse.json({ ok: false, error: 'Missing orderId in metadata' });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, userId: true }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' }
      });

      await prisma.notification.create({
        data: {
          userId: order.userId,
          message: `Your order with OrderID ${order.id.slice(0, 6)} has been placed successfully (Status: PAID)`
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Stripe webhook error:', err);

    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
