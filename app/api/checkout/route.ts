import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  centsToGbp,
  getPixelPriceCents,
  sanitizeUrl,
  validatePixelInput,
} from '@/lib/pixel-security';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!stripeSecret) throw new Error('Missing STRIPE_SECRET_KEY');
if (!appUrl) throw new Error('Missing NEXT_PUBLIC_APP_URL');

const stripe = new Stripe(stripeSecret);
const RESERVATION_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pixel = validatePixelInput(body);

    const { data: existingPixel, error: pixelLookupError } = await supabaseAdmin
      .from('Pixels')
      .select('x, y')
      .eq('x', pixel.x)
      .eq('y', pixel.y)
      .maybeSingle();

    if (pixelLookupError) {
      console.error('Pixel lookup failed:', pixelLookupError);
      return NextResponse.json({ error: 'Unable to check pixel availability' }, { status: 503 });
    }

    const kind = existingPixel ? 'reclaim' : 'claim';
    const amountCents = getPixelPriceCents(pixel.x, pixel.y, kind === 'reclaim');

    const cutoff = new Date(Date.now() - RESERVATION_MINUTES * 60_000).toISOString();
    await supabaseAdmin
      .from('pixel_orders')
      .update({ status: 'cancelled' })
      .eq('x', pixel.x)
      .eq('y', pixel.y)
      .eq('status', 'pending')
      .lt('created_at', cutoff);

    const orderId = crypto.randomUUID();
    const { error: orderError } = await supabaseAdmin.from('pixel_orders').insert({
      id: orderId,
      x: pixel.x,
      y: pixel.y,
      color: pixel.color,
      display_text: pixel.displayText,
      country_flag: pixel.countryFlag,
      social_link: sanitizeUrl(pixel.socialLink),
      amount_cents: amountCents,
      currency: 'gbp',
      kind,
      status: 'pending',
    });

    if (orderError) {
      if (orderError.code === '23505') {
        return NextResponse.json(
          { error: 'This pixel is currently being purchased by someone else. Please try again shortly.' },
          { status: 409 },
        );
      }
      console.error('Order creation failed:', orderError);
      return NextResponse.json({ error: 'Unable to reserve pixel' }, { status: 503 });
    }

    try {
      const session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: `${kind === 'reclaim' ? 'Reclaim' : 'Claim'} tile (${pixel.x}, ${pixel.y})`,
                  description: `Pixel Battle — ${pixel.displayText}`,
                },
                unit_amount: amountCents,
              },
              quantity: 1,
            },
          ],
          metadata: {
            order_id: orderId,
            x: String(pixel.x),
            y: String(pixel.y),
            kind,
          },
          success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/?payment=cancelled`,
        },
        { idempotencyKey: `pixel-order-${orderId}` },
      );

      const { error: sessionUpdateError } = await supabaseAdmin
        .from('pixel_orders')
        .update({ stripe_session_id: session.id })
        .eq('id', orderId)
        .eq('status', 'pending');

      if (sessionUpdateError) {
        await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
        await supabaseAdmin.from('pixel_orders').update({ status: 'cancelled' }).eq('id', orderId);
        console.error('Failed to attach Stripe session:', sessionUpdateError);
        return NextResponse.json({ error: 'Unable to create payment' }, { status: 503 });
      }

      return NextResponse.json({
        url: session.url,
        price: centsToGbp(amountCents),
        currency: 'gbp',
        orderId,
      });
    } catch (stripeError) {
      await supabaseAdmin.from('pixel_orders').update({ status: 'cancelled' }).eq('id', orderId);
      console.error('Stripe checkout error:', stripeError);
      return NextResponse.json({ error: 'Payment could not be started' }, { status: 502 });
    }
  } catch (error) {
    console.error('Checkout validation error:', error);
    return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 });
  }
}
