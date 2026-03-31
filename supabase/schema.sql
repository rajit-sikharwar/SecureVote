-- SecureVote Student-Focused Schema
-- College-level voting management platform

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Users table with complete student academic information
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  address text not null,
  college_name text not null,
  enrollment_number text not null unique,
  roll_number text not null,
  admission_year integer not null,
  course text not null check (course in ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
  year integer not null check (year between 1 and 4),
  section text not null check (section in ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
  photo_url text,
  role text not null check (role in ('admin', 'student')) default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

-- Candidates table (admin creates candidate profiles)
create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  description text not null,
  course text not null check (course in ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
  year integer not null check (year between 1 and 4),
  section text not null check (section in ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
  created_at timestamptz not null default timezone('utc', now())
);

-- Elections table with eligibility based on course, year, section
create table public.elections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  course text not null check (course in ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
  year integer not null check (year between 1 and 4),
  section text not null check (section in ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references public.users (id) on delete cascade
);

-- Election candidates many-to-many relationship
create table public.election_candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections (id) on delete cascade,
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  unique (election_id, candidate_id)
);

-- Votes table with constraint: one vote per user per election
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  election_id uuid not null references public.elections (id) on delete cascade,
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, election_id)
);

-- Audit logs for tracking actions
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  performed_by uuid not null references public.users (id) on delete cascade,
  target_id text not null,
  timestamp timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb
);

-- Helper function to check if user is admin
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
    where id = coalesce(p_user_id, auth.uid())
      and role = 'admin'
      and is_active = true
  );
$$;

-- Function to cast vote with security checks
create or replace function public.cast_vote(
  p_user_id uuid,
  p_election_id uuid,
  p_candidate_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_course text;
  v_user_year integer;
  v_user_section text;
  v_election_course text;
  v_election_year integer;
  v_election_section text;
  v_start_time timestamptz;
  v_end_time timestamptz;
  v_now timestamptz := timezone('utc', now());
begin
  -- Get user details
  select course, year, section
  into v_user_course, v_user_year, v_user_section
  from public.users
  where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  -- Get election details
  select course, year, section, start_time, end_time
  into v_election_course, v_election_year, v_election_section, v_start_time, v_end_time
  from public.elections
  where id = p_election_id;

  if not found then
    raise exception 'Election not found';
  end if;

  -- Check eligibility
  if v_user_course != v_election_course or v_user_year != v_election_year or v_user_section != v_election_section then
    raise exception 'You are not eligible to vote in this election';
  end if;

  -- Check time window
  if v_now < v_start_time then
    raise exception 'Election has not started yet';
  end if;

  if v_now > v_end_time then
    raise exception 'Election has ended';
  end if;

  -- Check if already voted
  if exists (select 1 from public.votes where user_id = p_user_id and election_id = p_election_id) then
    raise exception 'You have already voted in this election';
  end if;

  -- Check if candidate belongs to this election
  if not exists (select 1 from public.election_candidates where election_id = p_election_id and candidate_id = p_candidate_id) then
    raise exception 'Invalid candidate for this election';
  end if;

  -- Insert vote
  insert into public.votes (user_id, election_id, candidate_id)
  values (p_user_id, p_election_id, p_candidate_id);

  -- Log the action
  insert into public.audit_logs (action, performed_by, target_id, metadata)
  values (
    'vote_cast',
    p_user_id,
    p_election_id::text,
    jsonb_build_object('candidateId', p_candidate_id)
  );
end;
$$;

-- Function to get election results (admin only, bypasses RLS)
create or replace function public.get_election_results(p_election_id uuid)
returns table (
  candidate_id uuid,
  candidate_name text,
  photo_url text,
  vote_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verify caller is admin
  if not public.is_admin() then
    raise exception 'Access denied: Admin privileges required';
  end if;

  return query
  select
    c.id as candidate_id,
    c.name as candidate_name,
    c.photo_url,
    coalesce(count(v.id), 0)::bigint as vote_count
  from election_candidates ec
  join candidates c on c.id = ec.candidate_id
  left join votes v on v.candidate_id = c.id and v.election_id = p_election_id
  where ec.election_id = p_election_id
  group by c.id, c.name, c.photo_url
  order by vote_count desc, c.name;
end;
$$;

-- Function to get total vote count for an election (admin only)
create or replace function public.get_election_vote_count(p_election_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count bigint;
begin
  -- Verify caller is admin
  if not public.is_admin() then
    raise exception 'Access denied: Admin privileges required';
  end if;

  select count(*) into v_count
  from votes
  where election_id = p_election_id;

  return coalesce(v_count, 0);
end;
$$;

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.candidates enable row level security;
alter table public.elections enable row level security;
alter table public.election_candidates enable row level security;
alter table public.votes enable row level security;
alter table public.audit_logs enable row level security;

-- RLS Policies for users table
create policy "Users can view their own profile or admins can view all"
on public.users
for select
using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can create their own profile"
on public.users
for insert
with check (auth.uid() = id and role = 'student');

create policy "Admins can manage all users"
on public.users
for all
using (public.is_admin())
with check (public.is_admin());

-- RLS Policies for candidates table
create policy "Authenticated users can read candidates"
on public.candidates
for select
using (auth.role() = 'authenticated');

create policy "Admins can manage candidates"
on public.candidates
for all
using (public.is_admin())
with check (public.is_admin());

-- RLS Policies for elections table
create policy "Authenticated users can read elections"
on public.elections
for select
using (auth.role() = 'authenticated');

create policy "Admins can manage elections"
on public.elections
for all
using (public.is_admin())
with check (public.is_admin());

-- RLS Policies for election_candidates table
create policy "Authenticated users can read election candidates"
on public.election_candidates
for select
using (auth.role() = 'authenticated');

create policy "Admins can manage election candidates"
on public.election_candidates
for all
using (public.is_admin())
with check (public.is_admin());

-- RLS Policies for votes table
create policy "Users can read their own votes"
on public.votes
for select
using (user_id = auth.uid());

-- Enhanced admin policy for vote results
create policy "Admins can read all votes for results"
on public.votes
for select
using (
  exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role = 'admin'
      and users.is_active = true
  )
);

-- RLS Policies for audit logs
create policy "Admins can read audit logs"
on public.audit_logs
for select
using (public.is_admin());

create policy "Users can insert audit logs for themselves"
on public.audit_logs
for insert
with check (performed_by = auth.uid());

-- Grant necessary permissions
grant execute on function public.cast_vote(uuid, uuid, uuid) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.get_election_results(uuid) to authenticated;
grant execute on function public.get_election_vote_count(uuid) to authenticated;

-- Create indexes for performance
create index idx_users_enrollment on public.users (enrollment_number);
create index idx_users_course_year_section on public.users (course, year, section);
create index idx_candidates_course_year_section on public.candidates (course, year, section);
create index idx_elections_course_year_section on public.elections (course, year, section);
create index idx_elections_time on public.elections (start_time, end_time);
create index idx_votes_user_election on public.votes (user_id, election_id);
create index idx_votes_election on public.votes (election_id);
create index idx_election_candidates_election on public.election_candidates (election_id);
