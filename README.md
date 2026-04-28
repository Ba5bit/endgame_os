# Endgame OS

Endgame OS is a modern chess training prototype built with Next.js, TypeScript, Tailwind CSS, Supabase, Stockfish, `chess.js`, and `react-chessboard`.

It lets a player:

- play as White against Stockfish
- choose AI difficulty
- review completed games with an AI Coach
- save finished games and reviews to Supabase
- track profile stats
- compare players on a Kazakhstan city leaderboard
- preview locked Pro features without real payments

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Supabase Auth and Postgres
- Stockfish in a Web Worker
- `chess.js`
- `react-chessboard`

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The chess trainer is at:

```text
http://localhost:3000/play
```

## Supabase Setup

Create a Supabase project, then get these values from:

```text
Project Settings -> API
```

Use:

- Project URL
- anon public key

Put them in `.env.local`.

### Database Migrations

Login to Supabase CLI:

```bash
npx supabase login
```

Link the local repo to your project:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

Apply migrations:

```bash
npx supabase db push
```

Migration files live in:

```text
supabase/migrations/
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run db:dry-run
npm run db:push
```

## Security Notes

Do not commit real secrets.

This repo intentionally ignores:

- `.env`
- `.env.local`
- `.env.*.local`
- `supabase/.temp`
- local logs
- `.next`
- `node_modules`

Safe to commit:

- `.env.example`
- SQL migrations
- app source code

Never commit:

- Supabase service role key
- Supabase access token
- database password
- real `.env.local`
- private API keys

The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is designed to be used in browser apps, but it should still live in `.env.local` and not be hardcoded into source files.

If a secret was already pushed to GitHub, rotate it in Supabase immediately.

## Main Routes

- `/` landing page
- `/play` chess trainer
- `/auth` sign in / sign up
- `/profile` player stats
- `/leaderboard` Kazakhstan leaderboard

## Current Prototype Limits

- Pro upgrade is a fake modal only.
- Stripe is not connected.
- Accuracy is estimated from Stockfish eval swings.
- Advanced weakness reports and opening prep are locked preview features.
