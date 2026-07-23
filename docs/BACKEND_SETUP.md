# DrivePro Backend Setup — QS Drive Pro-db

Run these steps in order. Total time: about 15 minutes.

## Step 1 — Run the SQL files

Open your Supabase dashboard → **SQL Editor** → **New query**, then paste and run each file **in this exact order**:

1. `01_schema.sql` — enums, all 13 tables, constraints, indexes
2. `02_functions_triggers.sql` — auto student numbers (DP-2026-0001), auto receipts (RCT-000001), updated_at maintenance, audit logging, dashboard views
3. `03_rls_policies.sql` — Row-Level Security for Manager / Secretary / Instructor
4. `04_storage_seed.sql` — storage buckets + sample packages, vehicles, staff

Each should finish with "Success. No rows returned." If a file errors, fix that error before moving to the next file (later files depend on earlier ones).

## Step 2 — Create your first users

RLS is now on, so you need real accounts:

1. Dashboard → **Authentication** → **Users** → **Add user**. Create:
   - manager@drivepro.test (set a password)
   - secretary@drivepro.test
   - instructor1@drivepro.test
2. Copy each new user's **UUID** from the Authentication page.
3. Back in the SQL Editor, link them to profiles and staff records:

```sql
insert into public.users (id, email, role, staff_id)
values
  ('PASTE-MANAGER-AUTH-UUID',    'manager@drivepro.test',    'manager',
     (select id from staff where email = 'manager@drivepro.test')),
  ('PASTE-SECRETARY-AUTH-UUID',  'secretary@drivepro.test',  'secretary',
     (select id from staff where email = 'secretary@drivepro.test')),
  ('PASTE-INSTRUCTOR-AUTH-UUID', 'instructor1@drivepro.test','instructor',
     (select id from staff where email = 'instructor1@drivepro.test'));
```

## Step 3 — Connect the React frontend

```bash
npm install @supabase/supabase-js
```

Copy `supabaseClient.js` into `src/lib/` in your React project. It already contains your project URL and anon key, plus working examples for login, student registration, payments, search/pagination, dashboard stats, and file uploads.

## Step 4 — Verify everything works

In the SQL Editor:

```sql
select * from public.driving_packages;      -- 5 sample packages
select * from public.students;              -- test student with auto number
select * from public.v_dashboard_stats;     -- dashboard metrics
```

Then in your app: log in as the manager, insert a payment, and confirm a receipt row appeared automatically in `receipts` and an entry in `audit_logs`.

## What you got

| Feature | Where |
|---|---|
| 13 tables, 3NF, matching your ER diagram | 01 |
| Auto student numbers (DP-YYYY-NNNN) | 02 |
| Auto receipt per payment (RCT-NNNNNN) | 02 |
| Audit logging (who changed what, before/after) | 02 |
| Dashboard, balances, revenue, upcoming-lesson views | 02 |
| Role-based security (Manager/Secretary/Instructor) | 03 |
| Private storage buckets for photos/cards/documents | 04 |
| Sample packages, vehicles, staff | 04 |

## Security notes

- The **anon key** in `supabaseClient.js` is safe to ship in your frontend — RLS is what protects the data.
- Never expose the **Service Role Key** in frontend code, chats, or GitHub. It bypasses all RLS.
- Audit logs are read-only even for managers — no one can tamper with them, which directly answers the client's concern about unauthorized edits and deletions.
