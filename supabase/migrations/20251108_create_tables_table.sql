/*
  # Create QR Tables (tables)

  1. New Table
    - tables
      - table_number (text, primary key) - e.g., A1, B2
      - seat_count (integer, default 2)
      - status (text, default 'available') - 'available' | 'occupied'
      - type (text, default '1_meja_pendek') - 'meja_panjang' | '2_meja_pendek' | '1_meja_pendek'
      - created_at (timestamptz, default now())

  2. Security
    - Enable RLS
    - Policy: public SELECT (so QR listing can be read if needed)
    - Policy: authenticated INSERT/UPDATE/DELETE (admin dashboard actions)
*/

create table if not exists tables (
  table_number text primary key,
  seat_count integer not null default 2,
  status text not null default 'available' check (status in ('available','occupied')),
  type text not null default '1_meja_pendek' check (type in ('meja_panjang','2_meja_pendek','1_meja_pendek')),
  created_at timestamptz not null default now()
);

alter table tables enable row level security;

-- Read access to everyone (suitable for listing)
create policy if not exists "Anyone can view tables"
  on tables for select
  to public
  using (true);

-- Mutations only for authenticated users (admin panel)
create policy if not exists "Authenticated can insert tables"
  on tables for insert
  to authenticated
  with check (true);

create policy if not exists "Authenticated can update tables"
  on tables for update
  to authenticated
  using (true)
  with check (true);

create policy if not exists "Authenticated can delete tables"
  on tables for delete
  to authenticated
  using (true);
