-- CFO Intelligence Platform — Initial Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Analyses table: stores every Claude response
create table if not exists public.analyses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,
  module      text not null check (module in ('excel-intake', 'strategy', 'automate', 'powerbi', 'sandbox', 'wizard')),
  input       jsonb not null default '{}',
  output      text not null,
  created_at  timestamptz not null default now()
);

-- Index for fast user + module lookups
create index if not exists analyses_user_id_idx on public.analyses(user_id);
create index if not exists analyses_module_idx on public.analyses(module);
create index if not exists analyses_created_at_idx on public.analyses(created_at desc);

-- Row Level Security
alter table public.analyses enable row level security;

-- Policy: users can only read their own analyses
create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid()::text = user_id);

-- Policy: service role can insert (API routes use service role key)
create policy "Service role can insert analyses"
  on public.analyses for insert
  with check (true);

-- Policy: service role can read all (for server-side queries)
create policy "Service role can read all analyses"
  on public.analyses for select
  using (true);
