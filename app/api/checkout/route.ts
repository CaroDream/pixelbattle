import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { x, y, color, displayText, countryFlag, socialLink, price } = body;

    console.log('Received:', { x, y, color, displayText, countryFlag, price });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Tile (${x}, ${y})`,
              description: `Claimed by ${displayText || 'Anonymous'}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?x=${x}&y=${y}&color=${encodeURIComponent(color)}&displayText=${encodeURIComponent(displayText || '')}&countryFlag=${encodeURIComponent(countryFlag || 'global')}&socialLink=${encodeURIComponent(socialLink || '')}&price=${price}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}