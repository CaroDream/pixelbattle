import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validatePixelInput } from '@/lib/pixel-security';

export const runtime = 'nodejs';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) throw new Error('Missing STRIPE_SECRET_KEY');
if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');

const stripe = new Stripe(stripeSecret);

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await fulfillSession(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabaseAdmin
          .from('pixel_orders')
          .update({ status: 'cancelled' })
          .eq('stripe_session_id', session.id)
          .in('status', ['pending', 'processing']);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook fulfillment failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function fulfillSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') {
    throw new Error(`Session ${session.id} is not paid`);
  }

  const orderId = session.metadata?.order_id;
  if (!orderId) throw new Error(`Missing order_id for session ${session.id}`);

  const { data: order, error: orderError } = await supabaseAdmin
    .from('pixel_orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError || !order) throw new Error(`Order ${orderId} not found`);
  if (order.status === 'paid') return;
  if (order.status !== 'pending') throw new Error(`Order ${orderId} is ${order.status}`);
  if (order.stripe_session_id !== session.id) throw new Error('Stripe session mismatch');
  if (session.currency !== 'gbp') throw new Error('Unexpected currency');
  if (session.amount_total !== order.amount_cents) throw new Error('Amount mismatch');

  // Atomically move the order out of pending so duplicate Stripe deliveries
  // cannot fulfill the same order concurrently.
  const { data: claimedOrder, error: claimError } = await supabaseAdmin
    .from('pixel_orders')
    .update({ status: 'processing' })
    .eq('id', orderId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();

  if (claimError) throw new Error(`Could not lock order: ${claimError.message}`);
  if (!claimedOrder) return;

  try {
    const pixel = validatePixelInput({
      x: order.x,
      y: order.y,
      color: order.color,
      displayText: order.display_text,
      countryFlag: order.country_flag,
      socialLink: order.social_link,
    });

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('Pixels')
      .select('x, y, color, display_text, country_flag, social_link, price')
      .eq('x', pixel.x)
      .eq('y', pixel.y)
      .maybeSingle();

    if (existingError) throw new Error(`Pixel lookup failed: ${existingError.message}`);

    const expectedPrice = order.amount_cents / 100;
    const alreadyOurPixel = existing &&
      existing.color === pixel.color &&
      existing.display_text === pixel.displayText &&
      existing.country_flag === pixel.countryFlag &&
      (existing.social_link || null) === (pixel.socialLink || null) &&
      Number(existing.price) === expectedPrice;

    if (order.kind === 'claim') {
      if (existing && !alreadyOurPixel) {
        throw new Error('Pixel was claimed before this payment was fulfilled');
      }

      if (!existing) {
        const { error: insertError } = await supabaseAdmin.from('Pixels').insert({
          x: pixel.x,
          y: pixel.y,
          color: pixel.color,
          display_text: pixel.displayText,
          country_flag: pixel.countryFlag,
          social_link: pixel.socialLink,
          price: expectedPrice,
        });
        if (insertError) throw new Error(`Pixel insert failed: ${insertError.message}`);
      }
    } else {
      if (!existing) throw new Error('Reclaim target no longer exists');

      if (!alreadyOurPixel) {
        const { error: updateError } = await supabaseAdmin
          .from('Pixels')
          .update({
            color: pixel.color,
            display_text: pixel.displayText,
            country_flag: pixel.countryFlag,
            social_link: pixel.socialLink,
            price: expectedPrice,
          })
          .eq('x', pixel.x)
          .eq('y', pixel.y);
        if (updateError) throw new Error(`Pixel update failed: ${updateError.message}`);
      }
    }

    const { error: orderUpdateError } = await supabaseAdmin
      .from('pixel_orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('status', 'processing');

    if (orderUpdateError) throw new Error(`Order status update failed: ${orderUpdateError.message}`);
  } catch (error) {
    await supabaseAdmin
      .from('pixel_orders')
      .update({ status: 'pending' })
      .eq('id', orderId)
      .eq('status', 'processing');
    throw error;
  }
}
