-- ============================================================
-- DrivePro — 04_storage_seed.sql  (run FOURTH)
-- Storage buckets + sample data for testing
-- ============================================================

-- ---------- STORAGE BUCKETS (all private) ----------
insert into storage.buckets (id, name, public)
values
  ('student-photos',    'student-photos',    false),
  ('ghana-cards',       'ghana-cards',       false),
  ('licence-documents', 'licence-documents', false),
  ('receipts',          'receipts',          false)
on conflict (id) do nothing;

-- Storage access: manager + secretary can manage files; instructor can view photos
create policy storage_staff_all on storage.objects
  for all using (
    bucket_id in ('student-photos','ghana-cards','licence-documents','receipts')
    and public.get_my_role() in ('manager','secretary')
  ) with check (
    bucket_id in ('student-photos','ghana-cards','licence-documents','receipts')
    and public.get_my_role() in ('manager','secretary')
  );

create policy storage_instructor_photos on storage.objects
  for select using (
    bucket_id = 'student-photos'
    and public.get_my_role() = 'instructor'
  );

-- ---------- SAMPLE DRIVING PACKAGES ----------
insert into public.driving_packages (package_name, duration_weeks, lesson_count, total_fee)
values
  ('Beginner Package',      6,  12, 1500.00),
  ('Standard Package',      8,  16, 2000.00),
  ('Intensive Package',     4,  12, 1800.00),
  ('Refresher Course',      2,   4,  600.00),
  ('Automatic Only',        6,  10, 1400.00);

-- ---------- SAMPLE VEHICLES ----------
insert into public.vehicles (reg_no, make, model, transmission, status)
values
  ('GR-1234-24', 'Toyota',  'Corolla', 'manual',    'available'),
  ('GR-5678-24', 'Hyundai', 'Accent',  'automatic', 'available'),
  ('GW-9012-23', 'Kia',     'Rio',     'manual',    'maintenance');

-- ---------- SAMPLE STAFF ----------
insert into public.staff (first_name, last_name, phone, email, role, hire_date)
values
  ('Kwame',  'Mensah',  '0244000001', 'manager@drivepro.test',    'manager',    '2023-01-10'),
  ('Akosua', 'Boateng', '0244000002', 'secretary@drivepro.test',  'secretary',  '2023-03-15'),
  ('Yaw',    'Owusu',   '0244000003', 'instructor1@drivepro.test','instructor', '2023-02-01'),
  ('Ama',    'Asante',  '0244000004', 'instructor2@drivepro.test','instructor', '2024-06-20');

-- NOTE: sample students/payments are best created through the app UI
-- so that triggers (student numbers, receipts, audit logs) fire with a
-- real logged-in user. But you can insert a quick test student:
insert into public.students (first_name, last_name, gender, dob, phone, email)
values ('Kofi', 'Adjei', 'male', '2000-05-14', '0550000001', 'kofi.test@example.com');
