create table if not exists public.rsvps (
  id bigint generated always as identity primary key,
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 100),
  response text not null check (response in ('accept', 'decline')),
  submitted_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

-- Guests can submit a response, but cannot read, update, or delete RSVP records.
revoke all on table public.rsvps from public, anon, authenticated, service_role;
grant insert on table public.rsvps to anon;
revoke all on sequence public.rsvps_id_seq from public, anon, authenticated, service_role;
grant usage on sequence public.rsvps_id_seq to anon;

drop policy if exists "Allow guest RSVP submissions" on public.rsvps;
create policy "Allow guest RSVP submissions"
  on public.rsvps
  for insert
  to anon
  with check (
    char_length(trim(guest_name)) between 2 and 100
    and response in ('accept', 'decline')
  );
