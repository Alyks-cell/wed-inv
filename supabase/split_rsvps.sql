-- Run once in Supabase SQL Editor to split the existing rsvps table.
-- Existing rows are copied; the original rsvps table is kept as a backup.
begin;

create table if not exists public.accepted_rsvps (
  id bigint generated always as identity primary key,
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 100),
  submitted_at timestamptz not null default now()
);

create table if not exists public.declined_rsvps (
  id bigint generated always as identity primary key,
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 100),
  submitted_at timestamptz not null default now()
);

alter table public.accepted_rsvps enable row level security;
alter table public.declined_rsvps enable row level security;

revoke all on table public.accepted_rsvps, public.declined_rsvps from public, anon, authenticated, service_role;
grant insert on table public.accepted_rsvps, public.declined_rsvps to anon;

revoke all on sequence public.accepted_rsvps_id_seq, public.declined_rsvps_id_seq from public, anon, authenticated, service_role;
grant usage on sequence public.accepted_rsvps_id_seq, public.declined_rsvps_id_seq to anon;

drop policy if exists "Allow guest accepted RSVP submissions" on public.accepted_rsvps;
create policy "Allow guest accepted RSVP submissions"
  on public.accepted_rsvps
  for insert
  to anon
  with check (char_length(trim(guest_name)) between 2 and 100);

drop policy if exists "Allow guest declined RSVP submissions" on public.declined_rsvps;
create policy "Allow guest declined RSVP submissions"
  on public.declined_rsvps
  for insert
  to anon
  with check (char_length(trim(guest_name)) between 2 and 100);

insert into public.accepted_rsvps (guest_name, submitted_at)
select old.guest_name, old.submitted_at
from public.rsvps as old
where old.response = 'accept'
  and not exists (
    select 1 from public.accepted_rsvps as new
    where new.guest_name = old.guest_name
      and new.submitted_at = old.submitted_at
  );

insert into public.declined_rsvps (guest_name, submitted_at)
select old.guest_name, old.submitted_at
from public.rsvps as old
where old.response = 'decline'
  and not exists (
    select 1 from public.declined_rsvps as new
    where new.guest_name = old.guest_name
      and new.submitted_at = old.submitted_at
  );

-- Keep the old table as a backup, but stop accepting new rows there.
revoke insert on table public.rsvps from anon;
revoke usage on sequence public.rsvps_id_seq from anon;
drop policy if exists "Allow guest RSVP submissions" on public.rsvps;

commit;
