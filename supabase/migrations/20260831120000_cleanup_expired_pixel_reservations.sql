-- Keep expired test/abandoned reservations from blocking pixels forever.
-- The checkout session is also limited to the same 30-minute window.
create or replace function public.reserve_pixel(
  p_x integer,
  p_y integer,
  p_color text,
  p_display_text text,
  p_country_flag text,
  p_social_link text
) returns table(order_id uuid, amount_gbp_pence integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order uuid;
  v_amount integer;
begin
  if p_x < 0 or p_x > 49 or p_y < 0 or p_y > 49 then raise exception 'Invalid coordinates'; end if;
  if p_color !~ '^#[0-9A-Fa-f]{6}$' then raise exception 'Invalid color'; end if;
  if p_display_text is not null and char_length(p_display_text) > 30 then raise exception 'Display text too long'; end if;
  if p_country_flag is not null and char_length(p_country_flag) > 20 then raise exception 'Invalid country'; end if;
  if p_social_link is not null and char_length(p_social_link) > 2048 then raise exception 'Social link too long'; end if;

  delete from public.pixel_reservations r
  using public.pixel_orders o
  where r.order_id = o.id
    and r.expires_at < now();

  update public.pixel_orders
  set status = 'expired'
  where status = 'pending'
    and expires_at < now();

  if exists (select 1 from public."Pixels" where x = p_x and y = p_y) then
    raise exception 'Pixel already claimed';
  end if;

  v_amount := public.pixel_price(p_x, p_y);

  insert into public.pixel_orders(
    x, y, color, display_text, country_flag, social_link, amount_gbp_pence
  ) values (
    p_x, p_y, p_color,
    coalesce(nullif(p_display_text, ''), 'Anonymous'),
    coalesce(nullif(p_country_flag, ''), 'global'),
    p_social_link,
    v_amount
  ) returning id into v_order;

  insert into public.pixel_reservations(x, y, order_id, expires_at)
  values (p_x, p_y, v_order, now() + interval '30 minutes');

  return query select v_order, v_amount;
exception
  when unique_violation then
    raise exception 'Pixel is currently reserved';
end;
$$;

revoke all on function public.reserve_pixel(integer, integer, text, text, text, text) from public, anon, authenticated;
grant execute on function public.reserve_pixel(integer, integer, text, text, text, text) to service_role;
