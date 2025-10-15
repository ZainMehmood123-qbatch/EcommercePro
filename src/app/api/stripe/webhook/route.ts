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
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error('Missing orderId in session metadata');
        return NextResponse.json({ ok: false });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' }
      });

      console.log(`Order ${orderId} marked as PAID`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    if (err instanceof Error) {
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);
    }
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
