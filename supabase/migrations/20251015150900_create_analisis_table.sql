-- Create table analisis
create table if not exists public.analisis (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

-- Helpful index
create index if not exists idx_analisis_created_at on public.analisis(created_at desc);

-- Enable RLS (adjust policies as needed)
alter table public.analisis enable row level security;

-- TEMP permissive policy (replace with stricter admin-only policy later)
drop policy if exists "analisis_all" on public.analisis;
create policy "analisis_all" on public.analisis for all using (true) with check (true);
