import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    if (!sessionId || !/^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(sessionId)) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const orderId = session.metadata?.order_id;
    if (!orderId) return NextResponse.json({ status: 'unknown' }, { status: 404 });

    const { data: order, error } = await supabaseAdmin
      .from('pixel_orders')
      .select('id,x,y,color,display_text,country_flag,social_link,amount_gbp_pence,status')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ status: 'unknown' }, { status: 404 });
    }

    // The webhook is the only authority that fulfills an order. Never infer
    // a successful purchase from Stripe alone on the client-facing endpoint.
    return NextResponse.json({
      status: order.status,
      order: {
        x: order.x,
        y: order.y,
        color: order.color,
        display_text: order.display_text,
        country_flag: order.country_flag,
        social_link: order.social_link,
        amount_gbp_pence: order.amount_gbp_pence,
      },
    }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
  }
}
