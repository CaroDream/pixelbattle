create or replace function public.pixel_price(p_x integer, p_y integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when sqrt((p_x - 25)^2 + (p_y - 25)^2) < 5 then 299
    when sqrt((p_x - 25)^2 + (p_y - 25)^2) < 15 then 199
    when sqrt((p_x - 25)^2 + (p_y - 25)^2) < 25 then 99
    else 49
  end
$$;
