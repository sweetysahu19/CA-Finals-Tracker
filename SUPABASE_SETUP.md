# Connect the tracker to Supabase

The application is already wired for Supabase. Complete these steps once; future GitHub Pages deployments will automatically reconnect to the same project.

## 1. Create the table and security policy

Create a Supabase project, open **SQL Editor**, and run:

```sql
create table public.tracker_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.tracker_state enable row level security;

create policy "Users manage their own tracker"
on public.tracker_state
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

The `state` column stores the complete tracker: progress, chapter and topic checks, custom topics, notes, links, tasks, revision counts, roadmap checks and activity calendar data.

## 2. Enable sign-in

1. Open **Authentication → Providers** and enable Email.
2. Open **Authentication → URL Configuration**.
3. Set **Site URL** to `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
4. Add that exact URL to **Redirect URLs**.

## 3. Add the public project settings

Open the Supabase project **Connect** dialog and copy the Project URL and publishable key. Put them in `supabase-config.js`:

```js
window.SUPABASE_CONFIG = {
  url: "https://YOUR-PROJECT.supabase.co",
  publishableKey: "YOUR-PUBLISHABLE-KEY"
};
```

The publishable/anon key is intended for browser applications when Row Level Security is enabled. Never add a `service_role` or secret key to GitHub.

## 4. Deploy and sign in

Commit and push the files to GitHub. On the published site, select **Sign in to sync**, create an account, confirm the email if requested, and sign in. Use the same account on every device.

Changes are cached locally immediately and sent to Supabase automatically. The header displays **Saved online** after a successful sync.
