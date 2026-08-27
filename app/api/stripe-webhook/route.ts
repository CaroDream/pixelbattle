import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function fulfill(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return;
  const orderId = session.metadata?.order_id;
  if (!orderId) throw new Error('Missing order_id metadata');

  const { data: order, error: orderError } = await supabaseAdmin
    .from('pixel_orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (orderError || !order) throw new Error('Order not found');
  if (order.status === 'paid') return;
  if (Number(session.amount_total) !== order.amount_gbp_pence) throw new Error('Stripe amount does not match order');

  const { error: pixelError } = await supabaseAdmin.from('Pixels').insert({
    x: order.x,
    y: order.y,
    color: order.color,
    display_text: order.display_text || 'Anonymous',
    country_flag: order.country_flag || 'global',
    social_link: order.social_link,
    price: order.amount_gbp_pence / 100,
  });
  if (pixelError && !pixelError.message.toLowerCase().includes('duplicate')) throw pixelError;

  const { error: updateError } = await supabaseAdmin
    .from('pixel_orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      stripe_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    })
    .eq('id', orderId);
  if (updateError) throw updateError;

  await supabaseAdmin.from('pixel_reservations').delete().eq('order_id', orderId);
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      await fulfill(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await supabaseAdmin.from('pixel_orders').update({ status: 'expired' }).eq('id', orderId).eq('status', 'pending');
        await supabaseAdmin.from('pixel_reservations').delete().eq('order_id', orderId);
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook fulfillment error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
