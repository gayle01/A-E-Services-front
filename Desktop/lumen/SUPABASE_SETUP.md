## Supabase Setup (Lumen LMS)

Use this checklist to move from mock mode to a real PostgreSQL database.

### 1) Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Save your database password somewhere safe.
3. Wait for project provisioning to complete.

### 2) Get your Postgres connection string

In Supabase dashboard:

1. Open your project.
2. Go to **Project Settings** -> **Database**.
3. Find **Connection string** (URI format).
4. Prefer the **Pooler** URI (better compatibility on some networks), ensure it includes `sslmode=require`.

Expected shape:

`postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require`

### 3) Configure local environment

At workspace root:

1. Copy `.env.example` to `.env`.
2. Replace placeholder values with your Supabase values.
3. Also set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET` (default: `assignment-files`)

PowerShell example:

`Copy-Item .env.example .env`

### 4) Create storage bucket (for file attachments)

In Supabase dashboard:

1. Go to **Storage** -> **Buckets**.
2. Create bucket named `assignment-files` (or match your `SUPABASE_STORAGE_BUCKET`).
3. Set it to public if you want direct public links.

### 5) Push schema to Supabase

Run:

`corepack pnpm --filter @workspace/db run push`

This applies the Drizzle schema to your database.

### 6) Seed sample data

Run:

`corepack pnpm --filter @workspace/scripts run seed`

This inserts starter courses, lessons, assignments, quizzes, and sample progress.

### 7) Start app in real DB mode

Run:

- API: `corepack pnpm --filter @workspace/api-server run dev:ps`
- LMS: `corepack pnpm --filter @workspace/lms run dev`

Important: do **not** use `dev:mock` for API.

### 8) Verify it is no longer mock mode

Create a course/lesson in admin UI, restart API, and confirm the data still exists.

If data survives restart, you are on real DB mode.
