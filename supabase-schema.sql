-- ── Tables ──────────────────────────────────────────────────────────

create table if not exists hand_reviews (
  id bigint generated always as identity primary key,
  user_id text not null,
  raw_input text not null,
  parsed_hand text,
  ai_response text,
  leak_signals text,
  created_at timestamptz default now()
);

create table if not exists session_logs (
  id bigint generated always as identity primary key,
  user_id text not null,
  raw_input text not null,
  parsed_session text,
  result_amount real,
  stakes text,
  location text,
  duration_minutes integer,
  created_at timestamptz default now()
);

create table if not exists leak_summaries (
  id bigint generated always as identity primary key,
  user_id text not null,
  category text not null,
  confidence real not null,
  count integer not null default 1,
  example text,
  last_updated_at timestamptz default now(),
  unique (user_id, category)
);

-- Persistent chat history (one conversation per user)
create table if not exists conversations (
  id bigint generated always as identity primary key,
  user_id text not null unique,
  messages jsonb not null default '[]',
  updated_at timestamptz default now()
);

-- Subscription status
create table if not exists subscriptions (
  id bigint generated always as identity primary key,
  user_id text not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'free',  -- 'free' | 'pro' | 'cancelled'
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────────────
-- (service role key bypasses RLS, so this protects anon key access)

alter table hand_reviews   enable row level security;
alter table session_logs   enable row level security;
alter table leak_summaries enable row level security;
alter table conversations  enable row level security;
alter table subscriptions  enable row level security;

-- Drop existing policies if re-running
drop policy if exists "own_hand_reviews"   on hand_reviews;
drop policy if exists "own_session_logs"   on session_logs;
drop policy if exists "own_leak_summaries" on leak_summaries;
drop policy if exists "own_conversations"  on conversations;
drop policy if exists "own_subscriptions"  on subscriptions;

create policy "own_hand_reviews"   on hand_reviews   for all using (user_id = auth.uid()::text);
create policy "own_session_logs"   on session_logs   for all using (user_id = auth.uid()::text);
create policy "own_leak_summaries" on leak_summaries for all using (user_id = auth.uid()::text);
create policy "own_conversations"  on conversations  for all using (user_id = auth.uid()::text);
create policy "own_subscriptions"  on subscriptions  for all using (user_id = auth.uid()::text);

-- ── Indexes ──────────────────────────────────────────────────────────

create index if not exists hand_reviews_user_id_idx   on hand_reviews(user_id);
create index if not exists session_logs_user_id_idx   on session_logs(user_id);
create index if not exists leak_summaries_user_id_idx on leak_summaries(user_id);
