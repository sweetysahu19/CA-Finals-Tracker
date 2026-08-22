create table if not exists public.ca_tracker_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ca_tracker_state enable row level security;

revoke all on public.ca_tracker_state from anon;
grant select, insert, update, delete on public.ca_tracker_state to authenticated;

create policy "Users can read only their tracker"
on public.ca_tracker_state for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create only their tracker"
on public.ca_tracker_state for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update only their tracker"
on public.ca_tracker_state for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete only their tracker"
on public.ca_tracker_state for delete to authenticated
using ((select auth.uid()) = user_id);
