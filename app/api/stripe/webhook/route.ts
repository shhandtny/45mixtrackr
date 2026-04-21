import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/billing';
import { createServiceClient } from '@/lib/supabase/service';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const service = createServiceClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return NextResponse.json({ ok: true });

    await service.from('profiles').update({
      stripe_customer_id: session.customer as string,
      plan: 'premium',
      subscription_status: 'active',
    }).eq('id', userId);
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const status = sub.status;
    const plan = status === 'active' || status === 'trialing' ? 'premium' : 'free';

    await service.from('profiles').update({
      subscription_status: status,
      stripe_subscription_id: sub.id,
      plan,
    }).eq('stripe_customer_id', customerId);
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    await service.from('profiles').update({
      plan: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
    }).eq('stripe_customer_id', customerId);
  }

  return NextResponse.json({ ok: true });
}
