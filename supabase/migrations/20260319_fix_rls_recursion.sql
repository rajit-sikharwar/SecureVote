create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = p_user_id
      and role = 'admin'
      and is_active = true
  );
$$;

drop policy if exists "Users can view their own profile or admins can view all" on public.users;
drop policy if exists "Users can update their own profile photo" on public.users;
drop policy if exists "Users can create their own voter profile" on public.users;
drop policy if exists "Admins can manage elections" on public.elections;
drop policy if exists "Authenticated users can read elections" on public.elections;
drop policy if exists "Admins can manage candidates" on public.candidates;
drop policy if exists "Authenticated users can read candidates" on public.candidates;
drop policy if exists "Authenticated users can create registrations" on public.registrations;
drop policy if exists "Public users can update registrations" on public.registrations;
drop policy if exists "Users can read their own pending registration or admins can read all" on public.registrations;
drop policy if exists "Admins can read registrations" on public.registrations;
drop policy if exists "Users can delete their consumed registration" on public.registrations;
drop policy if exists "Authenticated users can read their own votes or admins can read all" on public.votes;
drop policy if exists "Authenticated users can read audit logs if admin" on public.audit_logs;
drop policy if exists "Authenticated users can insert audit logs for themselves" on public.audit_logs;

create policy "Users can view their own profile or admins can view all"
on public.users
for select
using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile photo"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can create their own voter profile"
on public.users
for insert
with check (
  (auth.uid() = id and role = 'voter')
  or public.is_admin()
);

create policy "Admins can manage elections"
on public.elections
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated users can read elections"
on public.elections
for select
using (auth.role() = 'authenticated');

create policy "Admins can manage candidates"
on public.candidates
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated users can read candidates"
on public.candidates
for select
using (auth.role() = 'authenticated');

create policy "Authenticated users can create registrations"
on public.registrations
for insert
to anon, authenticated
with check (true);

create policy "Public users can update registrations"
on public.registrations
for update
to anon, authenticated
using (true)
with check (true);

create policy "Users can read their own pending registration or admins can read all"
on public.registrations
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.is_admin()
);

create policy "Admins can read registrations"
on public.registrations
for select
using (public.is_admin());

create policy "Users can delete their consumed registration"
on public.registrations
for delete
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.is_admin()
);

create policy "Authenticated users can read their own votes or admins can read all"
on public.votes
for select
using (
  voter_id = auth.uid()
  or public.is_admin()
);

create policy "Authenticated users can read audit logs if admin"
on public.audit_logs
for select
using (public.is_admin());

create policy "Authenticated users can insert audit logs for themselves"
on public.audit_logs
for insert
with check (performed_by = auth.uid());

grant execute on function public.is_admin(uuid) to authenticated;
