-- Run this after creating the users in Supabase Authentication.
-- Do not store or paste the user's password in project files.

with super_users(email, full_name) as (
  values
    ('ceehatinators@gmail.com', 'Cee Hatinators'),
    ('ndinimuridzi@ceehatinators.co.za', 'Celia Rimayi')
)
insert into public.profiles (id, email, full_name, role)
select
  auth.users.id,
  auth.users.email,
  super_users.full_name,
  'super_user'
from auth.users
inner join super_users on super_users.email = auth.users.email
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role,
  updated_at = now();
