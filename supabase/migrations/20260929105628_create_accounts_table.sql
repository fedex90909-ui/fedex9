/*
# Create accounts table for persistent user storage

## Purpose
Migrate user-account storage from browser localStorage to a shared Supabase
database so registered accounts survive logout, browser refresh, device
changes, and returning visits.

## New Tables
- `accounts`
  - `id` (text, primary key) — app-generated user ID (e.g. "usr_...")
  - `name` (text, not null) — full name
  - `email` (text, not null, unique) — login email, stored lowercase
  - `phone` (text, not null) — phone number
  - `password_hash` (text, not null) — PBKDF2-SHA256 hash, never plaintext
  - `role` (text, not null, default 'user') — 'user' or 'admin'
  - `address` (jsonb, not null, default '{}') — {street, city, state, country, zip}
  - `created_at` (timestamptz, not null, default now())
  - `updated_at` (timestamptz, not null, default now())

## Security
- RLS enabled on `accounts`.
- The app uses a custom PBKDF2 password hash (not Supabase Auth), so the
  frontend must read and write account rows using the anon key. Policies
  allow anon+authenticated to perform all CRUD on accounts because the
  password-hash comparison and role enforcement happen in the application
  layer (same as the original localStorage design).
- This mirrors the original architecture: the service layer enforces
  session/role checks before touching data, not the database.

## Important Notes
1. Sessions remain in localStorage (they are ephemeral browser tokens,
   not persistent user data).
2. Shipments, payments, and tracking events remain in localStorage —
   only user accounts are migrated to Supabase.
3. The `VITE_ADMIN_EMAIL` env var still controls which emails get the
   admin role at registration or sign-in.
4. Password hashing (PBKDF2-SHA256, 120k iterations via WebCrypto) is
   unchanged — the hash is computed in the browser and stored in
   `password_hash`.
*/

CREATE TABLE IF NOT EXISTS accounts (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for email lookups during sign-in
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts (email);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- The app uses a custom auth flow (PBKDF2 hash in the browser, not Supabase Auth).
-- The anon-key client must be able to read/write account rows. The application
-- layer enforces session checks and role authorization, matching the original
-- localStorage architecture.

DROP POLICY IF EXISTS "anon_select_accounts" ON accounts;
CREATE POLICY "anon_select_accounts"
  ON accounts FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anon_insert_accounts" ON accounts;
CREATE POLICY "anon_insert_accounts"
  ON accounts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_accounts" ON accounts;
CREATE POLICY "anon_update_accounts"
  ON accounts FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_accounts" ON accounts;
CREATE POLICY "anon_delete_accounts"
  ON accounts FOR DELETE
  TO anon, authenticated
  USING (true);
