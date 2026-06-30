// Anonymous telemetry ingest. The atom-eve CLI pings this on a successful agent
// install. No identifier is sent or stored: each row is a standalone count.
// Mirrors the skills.sh model (a single fire-and-forget endpoint). Records to
// Neon Postgres via DATABASE_URL (set by the Vercel <> Neon integration); if the
// database is unset or errors, it silently no-ops so the CLI is never affected.
import { neon } from "@neondatabase/serverless";

// Minimal structural types for the Vercel Node function signature, so this file
// needs no @vercel/node dependency (the platform injects the real types at build).
interface TelemetryRequest {
  query: Record<string, string | string[] | undefined>;
}
interface TelemetryResponse {
  setHeader(name: string, value: string): void;
  status(code: number): { end(): void };
}

const EVENTS = new Set(["install"]);

export default async function handler(req: TelemetryRequest, res: TelemetryResponse) {
  res.setHeader("cache-control", "no-store");

  try {
    const event = field(req.query.event);
    if (!event || !EVENTS.has(event)) return res.status(204).end();

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return res.status(204).end();

    const sql = neon(databaseUrl);
    await sql`
      insert into telemetry_events
        (event, agent, target, channel, cli_version, coding_agent, ci)
      values (
        ${event},
        ${field(req.query.agent)},
        ${field(req.query.target)},
        ${field(req.query.channel)},
        ${field(req.query.v)},
        ${field(req.query.host)},
        ${req.query.ci === "1"}
      )
    `;
  } catch {
    // Telemetry must never surface an error to the caller.
  }

  return res.status(204).end();
}

function field(value: unknown, max = 120): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}
