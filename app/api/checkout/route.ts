import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

const ALLOWED_FLAGS = new Set(['global','af','al','dz','ad','ao','ar','am','au','at','az','bs','bh','bd','bb','by','be','bz','bj','bt','bo','ba','bw','br','bn','bg','bf','bi','kh','cm','ca','cf','td','cl','cn','co','cg','cr','hr','cu','cy','cz','dk','do','ec','eg','sv','ee','et','fj','fi','fr','ge','de','gh','gr','gt','gn','ht','hn','hu','is','in','id','ir','iq','ie','il','it','jm','jp','jo','kz','ke','kw','kg','la','lv','lb','ly','lt','lu','mg','mw','my','mv','ml','mt','mr','mu','mx','md','mc','mn','me','ma','mz','mm','na','np','nl','nz','ni','ne','ng','mk','no','om','pk','pa','pg','py','pe','ph','pl','pt','qa','ro','ru','rw','sa','sn','rs','sg','sk','si','so','za','ss','es','lk','sd','sr','se','ch','sy','tw','tj','tz','th','tl','tg','to','tt','tn','tr','tm','ug','ua','ae','gb','us','uy','uz','vu','ve','vn','ye','zm','zw']);

function sanitizeUrl(raw: unknown): string | null { if (typeof raw !== 'string' || !raw.trim() || raw.length > 2048) return null; const value=raw.trim(); const normalized=value.startsWith('http://')||value.startsWith('https://')?value:`https://${value}`; try { const url=new URL(normalized); if(!['http:','https:'].includes(url.protocol)) return null; const host=url.hostname.toLowerCase(); if(!host.includes('.')||host==='localhost'||host.endsWith('.local')||host.endsWith('.internal')) return null; if(/^(127\.|10\.|192\.168\.|169\.254\.)/.test(host)||/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return null; return url.href; } catch { return null; } }

export async function POST(request: NextRequest) {
  try {
    const body=await request.json();
    const x=Number(body?.x),y=Number(body?.y);
    const color=typeof body?.color==='string'?body.color.trim():'';
    const displayText=typeof body?.displayText==='string'?body.displayText.trim().slice(0,30):'Anonymous';
    const countryFlag=typeof body?.countryFlag==='string'&&ALLOWED_FLAGS.has(body.countryFlag)?body.countryFlag:'global';
    const socialLink=sanitizeUrl(body?.socialLink);
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>49||y<0||y>49)return NextResponse.json({error:'Invalid tile coordinates'},{status:400});
    if(!/^#[0-9A-Fa-f]{6}$/.test(color))return NextResponse.json({error:'Invalid color'},{status:400});
    const {data:reservation,error:reservationError}=await supabaseAdmin.rpc('reserve_pixel',{p_x:x,p_y:y,p_color:color,p_display_text:displayText||'Anonymous',p_country_flag:countryFlag,p_social_link:socialLink});
    const row=Array.isArray(reservation)?reservation[0]:reservation;
    if(reservationError||!row)return NextResponse.json({error:reservationError?.message||'Tile unavailable'},{status:409});
    const orderId=String((row as {order_id:string}).order_id);
    const amount=Number((row as {amount_gbp_pence:number}).amount_gbp_pence);
    if(!Number.isInteger(amount)||amount<=0)return NextResponse.json({error:'Invalid server price'},{status:500});

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return NextResponse.json({error:'Payment is not configured'},{status:500});
    const stripe = new Stripe(stripeSecret);
    const appUrl = request.nextUrl.origin;
    const session=await stripe.checkout.sessions.create({mode:'payment',line_items:[{price_data:{currency:'gbp',product_data:{name:`Pixel Battle tile (${x}, ${y})`},unit_amount:amount},quantity:1}],client_reference_id:orderId,metadata:{order_id:orderId},success_url:`${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${appUrl}/`});
    const {error:updateError}=await supabaseAdmin.from('pixel_orders').update({stripe_session_id:session.id}).eq('id',orderId);
    if(updateError)throw updateError;
    return NextResponse.json({url:session.url});
  } catch(error) { console.error('Checkout error:',error); return NextResponse.json({error:'Payment failed or tile unavailable'},{status:500}); }
}
