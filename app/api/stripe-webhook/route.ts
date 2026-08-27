import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  const rawBody = await request.text();
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(rawBody, signature, secret); } catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }); }
  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== 'paid') return NextResponse.json({ received: true });
      const orderId = session.metadata?.order_id;
      if (!orderId) throw new Error('Missing order_id');
      const { data: order, error } = await supabaseAdmin.from('pixel_orders').select('amount_gbp_pence,status').eq('id', orderId).single();
      if (error || !order) throw new Error('Order not found');
      if (Number(session.amount_total) !== order.amount_gbp_pence) throw new Error('Amount mismatch');
      if (order.status === 'paid') return NextResponse.json({ received: true });
      const { error: fulfillError } = await supabaseAdmin.rpc('fulfill_pixel_order', { p_order_id: orderId, p_stripe_session_id: session.id, p_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null });
      if (fulfillError) throw fulfillError;
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await supabaseAdmin.from('pixel_orders').update({ status: 'expired' }).eq('id', orderId).eq('status', 'pending');
        await supabaseAdmin.from('pixel_reservations').delete().eq('order_id', orderId);
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) { console.error('Stripe webhook fulfillment error:', error); return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 }); }
}
