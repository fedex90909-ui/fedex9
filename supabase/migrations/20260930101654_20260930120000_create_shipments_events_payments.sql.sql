/*
# Create shipments, tracking_events, and payments tables

## Overview
This migration adds three new tables that the admin panel needs to collect
and display operational data: shipments, tracking events, and payments.
The existing `accounts` table (already created in a prior migration) stores
users. This migration wires up the rest of the data model.

## New Tables

### 1. `shipments`
Stores every shipment in the system — both demo seed shipments and real
customer bookings.
- `id` (text, primary key) — application-generated ID (e.g. `shp_xxx`)
- `user_id` (text, nullable) — references `accounts(id)`. NULL for demo
  shipments that are not tied to a registered account.
- `reference` (text, not null) — human-readable reference (e.g. `FX-ABCD-EFGH`)
- `tracking_number` (text, not null, unique) — FedEx-style tracking number
- `sender` (jsonb, not null) — sender address (name, email, phone, address lines)
- `recipient` (jsonb, not null) — recipient address
- `pkg` (jsonb, not null) — package info (type, weight, dimensions, description)
- `option_id` (text, not null) — delivery option ID (e.g. `overnight`, `2-day`)
- `shipping_method` (text, not null) — display name of the shipping method
- `price` (numeric, not null, default 0) — quoted price
- `status` (text, not null, default `created`) — shipment lifecycle status
- `current_location` (text, not null, default empty) — latest known location
- `estimated_delivery` (timestamptz, not null) — ETA timestamp
- `payment_status` (text, not null, default `unpaid`) — payment state
- `is_demo` (boolean, default false) — flags seeded demo shipments
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### 2. `tracking_events`
Stores the timeline events for each shipment (created, picked up, in transit,
delivered, etc.).
- `id` (text, primary key) — application-generated ID (e.g. `evt_xxx`)
- `shipment_id` (text, not null) — references `shipments(id)` ON DELETE CASCADE
- `status` (text, not null) — the status this event represents
- `location` (text, not null, default empty)
- `note` (text, not null, default empty)
- `timestamp` (timestamptz, not null, default now())
- `source` (text, not null, default `system`) — `system` or `admin`

### 3. `payments`
Stores payment records for shipments.
- `id` (text, primary key) — application-generated ID (e.g. `pay_xxx`)
- `shipment_id` (text, not null) — references `shipments(id)` ON DELETE CASCADE
- `user_id` (text, nullable) — references `accounts(id)`. NULL for demo payments.
- `method` (text, not null) — `card` or `transfer`
- `amount` (numeric, not null, default 0)
- `status` (text, not null, default `pending`)
- `reference` (text, not null) — payment reference (e.g. `PAY-ABCD-EFGH`)
- `card` (jsonb, nullable) — masked card metadata
- `transfer` (jsonb, nullable) — bank transfer metadata
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security
- RLS is enabled on all three new tables.
- This app uses a custom auth flow (PBKDF2 password hashing in the accounts
  table, not Supabase Auth). The frontend uses the anon key for all requests.
  Because there IS a sign-in screen but auth is managed in the accounts table
  (not auth.users), policies use `TO anon, authenticated` with `USING (true)`.
  The application layer enforces ownership and admin checks in the service
  functions — the same pattern the localStorage version used.
- The existing `accounts` table already has this same open policy pattern.

## Important Notes
1. The app manages its own auth via the `accounts` table (PBKDF2 hashing in
   the browser). It does NOT use Supabase Auth (auth.users). Therefore
   `auth.uid()` is always null and policies cannot use it for ownership.
   Access control is enforced in the service layer, matching the prior
   localStorage design.
2. ON DELETE CASCADE ensures that deleting a shipment also removes its
   tracking events and payments.
3. Indexes are added on frequently-queried columns.
*/

-- shipments
CREATE TABLE IF NOT EXISTS shipments (
  id text PRIMARY KEY,
  user_id text REFERENCES accounts(id) ON DELETE SET NULL,
  reference text NOT NULL,
  tracking_number text NOT NULL UNIQUE,
  sender jsonb NOT NULL DEFAULT '{}',
  recipient jsonb NOT NULL DEFAULT '{}',
  pkg jsonb NOT NULL DEFAULT '{}',
  option_id text NOT NULL,
  shipping_method text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'created',
  current_location text NOT NULL DEFAULT '',
  estimated_delivery timestamptz NOT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_shipments" ON shipments;
CREATE POLICY "anon_select_shipments" ON shipments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_shipments" ON shipments;
CREATE POLICY "anon_insert_shipments" ON shipments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_shipments" ON shipments;
CREATE POLICY "anon_update_shipments" ON shipments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_shipments" ON shipments;
CREATE POLICY "anon_delete_shipments" ON shipments FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at DESC);

-- tracking_events
CREATE TABLE IF NOT EXISTS tracking_events (
  id text PRIMARY KEY,
  shipment_id text NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  timestamp timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'system'
);

ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tracking_events" ON tracking_events;
CREATE POLICY "anon_select_tracking_events" ON tracking_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tracking_events" ON tracking_events;
CREATE POLICY "anon_insert_tracking_events" ON tracking_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tracking_events" ON tracking_events;
CREATE POLICY "anon_update_tracking_events" ON tracking_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tracking_events" ON tracking_events;
CREATE POLICY "anon_delete_tracking_events" ON tracking_events FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(timestamp);

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  shipment_id text NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  user_id text REFERENCES accounts(id) ON DELETE SET NULL,
  method text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  reference text NOT NULL,
  card jsonb,
  transfer jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_payments_shipment_id ON payments(shipment_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
