-- Run in Supabase SQL Editor (v2 schema)

create table if not exists users (
  name text primary key,
  tokens integer not null default 1000,
  joined_at timestamptz default now()
);

drop table if exists bets;

create table bets (
  id bigserial primary key,
  user_name text references users(name),
  market_id text not null,
  direction text not null check (direction in ('YES', 'NO')),
  bet_date text check (bet_date in ('mar20', 'mar25', 'mar31') or bet_date is null),
  multiplier numeric not null default 1.5,
  amount integer not null,
  created_at timestamptz default now(),
  unique(user_name, market_id)
);

alter table users enable row level security;
alter table bets enable row level security;

create policy "Public read users" on users for select using (true);
create policy "Public insert users" on users for insert with check (true);
create policy "Public update users" on users for update using (true);
create policy "Public read bets" on bets for select using (true);
create policy "Public insert bets" on bets for insert with check (true);
