import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
});

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
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error('Missing userId in session metadata');
        return NextResponse.json({ ok: false });
      }
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product']
      });

      const subtotal = (session.amount_subtotal ?? 0) / 100; 
      const tax = subtotal * 0.1; 
      const totalWithTax = subtotal + tax;

      await prisma.order.create({
        data: {
          userId,
          total: totalWithTax,
          tax: tax,
          paymentStatus: 'PAID',
          items: {
            create: lineItems.data.map((item) => {
              const product = item.price?.product as Stripe.Product | undefined;
              const metadata = product?.metadata ?? {};

              return {
                productId: metadata.productId ?? '',
                variantId: metadata.variantId ?? '',
                qty: item.quantity ?? 1,
                price:
                  item.amount_total && item.quantity
                    ? (item.amount_total / 100) / item.quantity
                    : 0
              };
            })
          }
        }
      });

      console.log(`Order successfully created for user ${userId}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);

    if (err instanceof Error) {
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);
    }

    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 400 }
    );
  }
}
