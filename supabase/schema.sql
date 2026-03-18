create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'voter')),
  category text check (category in ('student', 'teacher', 'staff', 'management')),
  photo_url text,
  is_active boolean not null default true,
  registered_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  category text not null check (category in ('student', 'teacher', 'staff', 'management')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.elections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  status text not null check (status in ('draft', 'active', 'closed')),
  eligible_categories text[] not null default '{}',
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  start_date timestamptz not null,
  end_date timestamptz not null,
  total_votes integer not null default 0
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections (id) on delete cascade,
  category text not null check (category in ('student', 'teacher', 'staff', 'management')),
  full_name text not null,
  department text not null,
  bio text not null,
  manifesto text,
  photo_url text,
  vote_count integer not null default 0,
  added_by uuid not null references public.users (id) on delete cascade,
  added_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.votes (
  id text primary key,
  election_id uuid not null references public.elections (id) on delete cascade,
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  voter_id uuid not null references public.users (id) on delete cascade,
  category text not null check (category in ('student', 'teacher', 'staff', 'management')),
  casted_at timestamptz not null default timezone('utc', now()),
  receipt_hash text not null unique
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  performed_by uuid not null references public.users (id) on delete cascade,
  target_id text not null,
  timestamp timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb
);

create or replace function public.cast_vote_secure(
  p_voter_id uuid,
  p_election_id uuid,
  p_candidate_id uuid,
  p_category text,
  p_receipt_hash text
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vote_id text := p_voter_id::text || '_' || p_election_id::text;
  v_status text;
begin
  select status into v_status
  from public.elections
  where id = p_election_id
  for update;

  if v_status is null then
    raise exception 'Election not found';
  end if;

  if v_status <> 'active' then
    raise exception 'This election is no longer active.';
  end if;

  if exists (select 1 from public.votes where id = v_vote_id) then
    raise exception 'already-exists';
  end if;

  insert into public.votes (
    id,
    election_id,
    candidate_id,
    voter_id,
    category,
    receipt_hash
  ) values (
    v_vote_id,
    p_election_id,
    p_candidate_id,
    p_voter_id,
    p_category,
    p_receipt_hash
  );

  update public.candidates
  set vote_count = vote_count + 1
  where id = p_candidate_id
    and election_id = p_election_id
    and category = p_category;

  if not found then
    raise exception 'Candidate not available for this category.';
  end if;

  update public.elections
  set total_votes = total_votes + 1
  where id = p_election_id;

  insert into public.audit_logs (
    action,
    performed_by,
    target_id,
    metadata
  ) values (
    'vote_cast',
    p_voter_id,
    p_election_id::text,
    jsonb_build_object(
      'candidateId', p_candidate_id,
      'category', p_category,
      'receiptHash', p_receipt_hash
    )
  );

  return p_receipt_hash;
end;
$$;

alter table public.users enable row level security;
alter table public.registrations enable row level security;
alter table public.elections enable row level security;
alter table public.candidates enable row level security;
alter table public.votes enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can view their own profile or admins can view all"
on public.users
for select
using (auth.uid() = id or exists (
  select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
));

create policy "Users can update their own profile photo"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins can manage elections"
on public.elections
for all
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Authenticated users can read elections"
on public.elections
for select
using (auth.role() = 'authenticated');

create policy "Admins can manage candidates"
on public.candidates
for all
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Authenticated users can read candidates"
on public.candidates
for select
using (auth.role() = 'authenticated');

create policy "Authenticated users can create registrations"
on public.registrations
for insert
with check (true);

create policy "Admins can read registrations"
on public.registrations
for select
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Authenticated users can read their own votes or admins can read all"
on public.votes
for select
using (
  voter_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

create policy "Authenticated users can read audit logs if admin"
on public.audit_logs
for select
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

grant execute on function public.cast_vote_secure(uuid, uuid, uuid, text, text) to authenticated;
