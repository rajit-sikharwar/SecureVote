drop policy if exists "Authenticated users can create registrations" on public.registrations;
drop policy if exists "Public users can update registrations" on public.registrations;
drop policy if exists "Users can read their own pending registration or admins can read all" on public.registrations;
drop policy if exists "Admins can read registrations" on public.registrations;
drop policy if exists "Users can delete their consumed registration" on public.registrations;

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
