# RSVP database setup

The invitation submits each RSVP through the Vercel function in `api/rsvp.mjs`. Acceptances are stored in `accepted_rsvps`; declines are stored in `declined_rsvps`. Guests can submit rows but cannot read, update, or delete RSVP data.

## Split an existing `rsvps` table

1. Open the Supabase project's **SQL Editor**.
2. Open [`supabase/split_rsvps.sql`](supabase/split_rsvps.sql), copy its contents, paste them into a new SQL query, and run it.
3. In **Table Editor**, confirm that `accepted_rsvps` and `declined_rsvps` appear. The script copies the matching old rows into these tables and keeps the original `rsvps` table as a backup.
4. Deploy this updated project to Vercel. New responses will go into the matching table.

## Set up a new database

For a new project with no existing `rsvps` table, run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor instead. It creates both tables and their guest submission policies.

## Vercel settings

In the Vercel project, open **Settings → Environment Variables** and add these values for Production (and Preview if used):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your project's publishable key (`sb_publishable_…`) |

The `.env.local` file is ignored by Git. Add the same values in Vercel and redeploy after changing the variables.

## View responses

Open Supabase **Table Editor** and select `accepted_rsvps` or `declined_rsvps`. Each table has the guest name and submission time.

## Official setup references

- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Data REST API](https://supabase.com/docs/guides/api)
- [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
