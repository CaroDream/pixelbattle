-- Make Stripe fulfillment atomic and idempotent.
create or replace function public.fulfill_pixel_order(
  p_order_id uuid,
  p_stripe_session_id text,
  p_payment_intent_id text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.pixel_orders%rowtype;
begin
  select * into v_order
  from public.pixel_orders
  where id = p_order_id
  for update;

  if not found then raise exception 'Order not found'; end if;
  if v_order.status = 'paid' then return true; end if;
  if v_order.status <> 'pending' then raise exception 'Order is not payable'; end if;
  if v_order.expires_at < now() then raise exception 'Order expired'; end if;

  insert into public."Pixels" (x, y, color, display_text, country_flag, social_link, price)
  values (
    v_order.x, v_order.y, v_order.color,
    coalesce(v_order.display_text, 'Anonymous'),
    coalesce(v_order.country_flag, 'global'),
    v_order.social_link,
    v_order.amount_gbp_pence / 100.0
  );

  update public.pixel_orders
  set status = 'paid', paid_at = now(),
      stripe_session_id = p_stripe_session_id,
      stripe_payment_intent_id = p_payment_intent_id
  where id = p_order_id and status = 'pending';

  delete from public.pixel_reservations where order_id = p_order_id;
  return true;
exception
  when unique_violation then
    raise exception 'Pixel already claimed';
end;
$$;

revoke all on function public.fulfill_pixel_order(uuid,text,text) from public, anon, authenticated;
grant execute on function public.fulfill_pixel_order(uuid,text,text) to service_role;
