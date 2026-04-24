create table if not exists hand_reviews (
  id bigint generated always as identity primary key,
  user_id text not null default 'default',
  raw_input text not null,
  parsed_hand text,
  ai_response text,
  leak_signals text,
  created_at timestamptz default now()
);

create table if not exists session_logs (
  id bigint generated always as identity primary key,
  user_id text not null default 'default',
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
  user_id text not null default 'default',
  category text not null,
  confidence real not null,
  count integer not null default 1,
  example text,
  last_updated_at timestamptz default now(),
  unique (user_id, category)
);
