# Supabase setup for notes and links

The current tracker works without Supabase and keeps all data in the browser. Follow this guide when you are ready to sync only notes and links between devices.

## 1. Create the database table

Create a Supabase project, open **SQL Editor**, and run:

```sql
create table public.tracker_notes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notes jsonb not null default '{}'::jsonb,
  links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.tracker_notes enable row level security;

create policy "Users manage their own tracker notes"
on public.tracker_notes
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

## 2. Configure authentication

1. In **Authentication → Providers**, enable Email.
2. In **Authentication → URL Configuration**, set the Site URL to your GitHub Pages address, such as `https://USERNAME.github.io/REPOSITORY/`.
3. Add the same exact address to Redirect URLs.

## 3. Get the browser-safe credentials

Copy the Project URL and publishable key from the project's **Connect** dialog or API settings. A publishable/anon key may be used in browser code when Row Level Security is enabled. Never place a `service_role` or secret key in this repository.

## 4. Connect the application code

The app still needs a small sign-in screen plus JavaScript that:

1. Creates the Supabase client with the Project URL and publishable key.
2. Signs the user in through Supabase Auth.
3. Loads the signed-in user's `notes` and `links` row.
4. Upserts notes and links after Save, using the authenticated user's ID as `user_id`.

Do not sync attachments, progress, tasks, or the syllabus table if you want only notes and links shared. Those can continue to use browser storage.
