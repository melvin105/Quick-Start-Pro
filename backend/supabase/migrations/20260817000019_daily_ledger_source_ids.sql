-- Expose stable source identifiers and the raw expense category so the Records
-- screen can edit/delete expense rows while still reading the unified ledger.
create or replace view public.v_daily_ledger as
select
  p.payment_date as entry_date,
  p.created_at as entry_time,
  st.first_name || ' ' || st.last_name || ' (payment)' as description,
  'Income' as category,
  p.amount as income,
  null::numeric as expense,
  p.id as entry_id,
  'income'::text as entry_type,
  null::text as source_category
from public.payments p
join public.students st on st.id = p.student_id
union all
select
  e.expense_date,
  e.created_at,
  coalesce(e.description, e.category::text),
  initcap(replace(e.category::text, '_', ' ')),
  null::numeric,
  e.amount,
  e.id,
  'expense'::text,
  e.category::text
from public.expenses e
order by entry_date, entry_time;
