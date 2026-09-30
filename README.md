# AI MailGen

A React + TypeScript email generator. Pick a recipient, email type, tone, and
length, and it produces a formatted email you can copy or save to history.

## Features

- Five email types: General, Job Application, Leave Request, Meeting Request, Thank You
- Four tones: Professional, Friendly, Formal, Casual
- Three lengths: Short, Medium, Long
- Copy to clipboard and save to Supabase-backed history
- Dark and light mode (follows system preference, remembers your choice)

## Setup

```bash
npm install
cp .env.example .env
```

Then fill in `.env` with your own Supabase project values. Get them from
**Supabase Dashboard → Project Settings → Data API**.

You can find `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` there. The anon key
is designed to be public, but it still cannot be committed — keep it in `.env`.

## Database

Run the migration in `supabase/migrations/` against your Supabase project. It
creates the `saved_emails` table plus RLS policies.

Using the Supabase CLI:

```bash
supabase db push
```

Or paste the SQL into the dashboard under **SQL Editor** and run it.

## Run

```bash
npm run dev
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check without emitting |

## Security note

The included migration grants full read/write/delete access to the `anon` role
and there is no authentication screen, so anyone who knows your project URL can
read or delete saved emails. That is intentional for local/demo use. Add Supabase
Auth and tighten the RLS policies before deploying this anywhere public.
