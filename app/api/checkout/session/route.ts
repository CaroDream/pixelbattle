import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) throw new Error('Missing STRIPE_SECRET_KEY');

const stripe = new Stripe(stripeSecret);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 409 });
    }

    const orderId = session.metadata?.order_id;
    if (!orderId) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const { data: order, error } = await supabaseAdmin
      .from('pixel_orders')
      .select('x, y, color, display_text, country_flag, social_link, amount_cents, status')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({
      paid: order.status === 'paid',
      x: order.x,
      y: order.y,
      color: order.color,
      displayText: order.display_text,
      countryFlag: order.country_flag,
      socialLink: order.social_link,
      price: order.amount_cents / 100,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Checkout session lookup failed:', error);
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
  }
}
