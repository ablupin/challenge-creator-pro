-- Influencers table
create table if not exists influencers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text,
  niche text,
  brand_color text default '#6366f1',
  created_at timestamptz default now()
);

-- Challenges table (the promotions calendar entries)
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid references influencers(id) on delete cascade,
  title text not null,
  type text not null check (type in ('food', 'fitness')),
  drop_date date not null,
  expiry_date date not null,
  status text not null default 'active' check (status in ('draft', 'active', 'expired')),
  plan_json jsonb,
  pdf_url text,
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS but allow all for now (single-user tool)
alter table influencers enable row level security;
alter table challenges enable row level security;
create policy "allow all" on influencers for all using (true);
create policy "allow all" on challenges for all using (true);
