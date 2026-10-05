# RSVP database setup

The invitation stores guest responses in a Supabase Postgres table. Vercel receives form submissions through `api/rsvp.mjs` and forwards them with the publishable key. Row Level Security allows guests to insert RSVP rows but not read, update, or delete them.

## 1. Create the table

In your Supabase project's SQL Editor, run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the `rsvps` table and an insert-only policy for guest submissions. You can view responses while signed in to the Supabase dashboard.

## 2. Add private settings in Vercel

In the Vercel project, open **Settings → Environment Variables** and add these variables for Production (and Preview if you use preview deployments):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sxwyxtyawnosuabkxgnj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The `sb_publishable_…` key for this project |

The provided `.env.local` is ignored by Git. Add the same two values in Vercel under **Settings → Environment Variables** for Production (and Preview if used). The publishable key is intended for app use; database access is constrained by the SQL policy.

## 3. Deploy and view responses

Redeploy the Vercel project after adding the variables. The RSVP form then posts to `/api/rsvp`; successful replies appear in Supabase **Table Editor → `rsvps`** with the guest name, accept/decline response, and submission time.

Changing Vercel environment variables requires a new deployment before functions receive the new values.

## Official setup references

- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Data REST API](https://supabase.com/docs/guides/api)
- [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
