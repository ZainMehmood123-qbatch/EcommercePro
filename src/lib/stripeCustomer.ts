import { prisma } from '@/lib/prisma';
import { stripe } from './stripe';

export async function getOrCreateStripeCustomer(userId: string, email: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  if (user.stripeCustomerId) {
    try {
      await stripe.customers.retrieve(user.stripeCustomerId);
      return user.stripeCustomerId;
    } catch {
      console.warn('Stripe customer not found in Stripe, creating new one...');
    }
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id }
  });

  return customer.id;
}
