-- Telemetry schema for the atom-eve CLI install counts (Neon Postgres).
-- Run once against the database the Vercel <> Neon integration provisioned:
--   psql "$DATABASE_URL" -f api/schema.sql
-- No row identifies a user or machine; each is a standalone anonymous count.

create table if not exists telemetry_events (
  id           bigserial primary key,
  event        text not null,
  agent        text,
  target       text,
  channel      text,
  cli_version  text,
  coding_agent text,
  ci           boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists telemetry_events_agent_idx on telemetry_events (agent);
create index if not exists telemetry_events_created_at_idx on telemetry_events (created_at);
