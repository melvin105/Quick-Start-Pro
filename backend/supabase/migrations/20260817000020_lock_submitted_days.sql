-- A submitted day is frozen while the manager reviews it. Flagging the day
-- unlocks it for corrections; approval keeps it permanently locked.
create or replace function public.block_closed_day_changes()
returns trigger
language plpgsql
as $$
declare
  v_date date;
  v_status public.day_status;
begin
  v_date := coalesce(
    (to_jsonb(new) ->> 'payment_date')::date,
    (to_jsonb(new) ->> 'expense_date')::date,
    (to_jsonb(old) ->> 'payment_date')::date,
    (to_jsonb(old) ->> 'expense_date')::date
  );

  select status into v_status
  from public.daily_closures
  where closure_date = v_date;

  if v_status = 'closed' then
    raise exception 'Day % is closed and approved — records can no longer be changed', v_date;
  end if;
  if v_status = 'pending_approval' then
    raise exception 'Day % is submitted and locked for manager review', v_date;
  end if;
  return coalesce(new, old);
end;
$$;
