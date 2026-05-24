-- Rename the normal customer role from visitor to general_user.
-- Run this in the Supabase SQL Editor.

alter table public.profiles
drop constraint if exists profiles_role_check;

update public.profiles
set role = 'general_user'
where role = 'visitor';

alter table public.profiles
alter column role set default 'general_user';

alter table public.profiles
add constraint profiles_role_check
check (role in ('general_user', 'super_user'));

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'name'
    ),
    'general_user'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

drop policy if exists "profiles insert own visitor" on public.profiles;
drop policy if exists "profiles update own visitor fields" on public.profiles;
drop policy if exists "profiles insert own general user" on public.profiles;
drop policy if exists "profiles update own general user fields" on public.profiles;

create policy "profiles insert own general user"
on public.profiles for insert
with check (id = auth.uid() and role = 'general_user');

create policy "profiles update own general user fields"
on public.profiles for update
using (id = auth.uid() and role = 'general_user')
with check (id = auth.uid() and role = 'general_user');

notify pgrst, 'reload schema';
