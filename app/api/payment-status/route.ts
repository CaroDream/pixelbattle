import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    if (!sessionId || !sessionId.startsWith('cs_')) return NextResponse.json({ error: 'Invalid session' }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.order_id;
    if (!orderId) return NextResponse.json({ status: 'unknown' }, { status: 404 });

    const { data: order } = await supabaseAdmin
      .from('pixel_orders')
      .select('x,y,color,display_text,country_flag,social_link,amount_gbp_pence,status')
      .eq('id', orderId)
      .single();

    return NextResponse.json({ status: order?.status || (session.payment_status === 'paid' ? 'paid' : 'pending'), order });
  } catch {
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
  }
}
