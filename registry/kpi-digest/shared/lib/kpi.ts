// Read-only KPI digest reader. It pulls revenue KPIs from Stripe (MRR, active/new/churned
// subscriptions, and collected revenue) and product KPIs from PostHog (event volume plus top
// event trends), then assembles them into one weekly digest. It never creates, updates, or
// cancels anything in Stripe or PostHog.

export interface DateRange {
  since: string;
  until: string;
}

export interface TopAccount {
  customerId: string;
  monthlyAmount: number;
  subscriptionCount: number;
}

export interface RevenueKpis {
  currency: string;
  mixedCurrencies: boolean;
  mrr: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  newMrr: number;
  churnedSubscriptions: number;
  churnedMrr: number;
  collectedInWindow: number;
  topAccounts: TopAccount[];
}

export interface EventTrend {
  event: string;
  count: number;
  previousCount: number;
  changePct: number | null;
  shareOfTotalPct: number | null;
}

export interface ProductKpis {
  current: DateRange;
  comparison: DateRange;
  totalEvents: number;
  previousTotalEvents: number;
  totalEventsChangePct: number | null;
  topEvents: EventTrend[];
}

export interface KpiObservation {
  area: "revenue" | "product";
  severity: "info" | "watch" | "action";
  observation: string;
}

export interface KpiDigest {
  generatedAt: string;
  mode: "read_only_digest";
  window: { since: string; until: string; days: number };
  revenue: RevenueKpis;
  product: ProductKpis;
  observations: KpiObservation[];
  digestHint: string;
}

export const reviewKpisInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    windowDays: {
      type: "integer",
      minimum: 1,
      maximum: 90,
      description: "Lookback window in days for revenue and product metrics. Defaults to 7."
    },
    topAccountsLimit: {
      type: "integer",
      minimum: 1,
      maximum: 50,
      description: "How many top accounts by MRR to include. Defaults to 5."
    },
    topEventsLimit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "How many top PostHog events by volume to include. Defaults to 10."
    }
  }
} as const;

export interface ReviewKpisInput {
  windowDays?: number;
  topAccountsLimit?: number;
  topEventsLimit?: number;
}

export function normalizeReviewKpisInput(input: unknown): ReviewKpisInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("KPI digest input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    windowDays: optionalInteger(value.windowDays, "windowDays", 1, 90),
    topAccountsLimit: optionalInteger(value.topAccountsLimit, "topAccountsLimit", 1, 50),
    topEventsLimit: optionalInteger(value.topEventsLimit, "topEventsLimit", 1, 100)
  };
}

export async function reviewKpis(
  input: ReviewKpisInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<KpiDigest> {
  const parsed = normalizeReviewKpisInput(input);
  const windowDays = parsed.windowDays ?? 7;
  const topAccountsLimit = parsed.topAccountsLimit ?? 5;
  const topEventsLimit = parsed.topEventsLimit ?? 10;

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const [revenue, product] = await Promise.all([
    readRevenueKpis(windowStart, topAccountsLimit, fetchImpl),
    readProductKpis(isoDate(now), windowDays, topEventsLimit, fetchImpl)
  ]);

  return {
    generatedAt: now.toISOString(),
    mode: "read_only_digest",
    window: { since: isoDate(windowStart), until: isoDate(now), days: windowDays },
    revenue,
    product,
    observations: [...observeRevenue(revenue), ...observeProduct(product)],
    digestHint:
      "Combine these revenue and product KPIs into one short weekly digest for the team. Lead with the headline revenue movement, pair it with the matching product-usage signal, and flag anything worth investigating. This is read-only: do not claim to have changed subscriptions, tracking, dashboards, or any Stripe or PostHog configuration."
  };
}

// --- Stripe revenue KPIs -----------------------------------------------------------------

interface StripePrice {
  unit_amount: number | null;
  currency?: string;
  recurring?: { interval?: string; interval_count?: number } | null;
}

interface StripeSubscriptionItem {
  quantity?: number;
  price?: StripePrice | null;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  created: number;
  canceled_at: number | null;
  currency?: string;
  items?: { data?: StripeSubscriptionItem[] };
}

interface StripeInvoice {
  amount_paid?: number;
}

export async function readRevenueKpis(
  windowStart: Date,
  topAccountsLimit: number,
  fetchImpl: typeof fetch = fetch
): Promise<RevenueKpis> {
  const windowStartUnix = Math.floor(windowStart.getTime() / 1000);

  const [activeSubs, canceledSubs, paidInvoices] = await Promise.all([
    fetchSubscriptions("active", fetchImpl),
    fetchSubscriptions("canceled", fetchImpl),
    fetchPaidInvoices(windowStartUnix, fetchImpl)
  ]);

  const currencies = activeSubs
    .map((sub) => normalizeCurrency(sub))
    .filter((value): value is string => Boolean(value));
  const currency = dominantCurrency(currencies) ?? "usd";
  const mixedCurrencies = new Set(currencies).size > 1;

  const mrr = activeSubs.reduce((total, sub) => total + subscriptionMonthlyMinor(sub), 0);
  const newSubs = activeSubs.filter((sub) => sub.created >= windowStartUnix);
  const newMrr = newSubs.reduce((total, sub) => total + subscriptionMonthlyMinor(sub), 0);
  const churnedSubs = canceledSubs.filter(
    (sub) => sub.canceled_at !== null && sub.canceled_at >= windowStartUnix
  );
  const churnedMrr = churnedSubs.reduce((total, sub) => total + subscriptionMonthlyMinor(sub), 0);
  const collectedInWindow = paidInvoices.reduce((total, invoice) => total + (invoice.amount_paid ?? 0), 0);
  const topAccounts = buildTopAccounts(activeSubs, topAccountsLimit);

  return {
    currency,
    mixedCurrencies,
    mrr: toMajor(mrr),
    activeSubscriptions: activeSubs.length,
    newSubscriptions: newSubs.length,
    newMrr: toMajor(newMrr),
    churnedSubscriptions: churnedSubs.length,
    churnedMrr: toMajor(churnedMrr),
    collectedInWindow: toMajor(collectedInWindow),
    topAccounts: topAccounts.map((account) => ({
      ...account,
      monthlyAmount: toMajor(account.monthlyAmount)
    }))
  };
}

async function fetchSubscriptions(
  status: "active" | "canceled",
  fetchImpl: typeof fetch
): Promise<StripeSubscription[]> {
  const payload = await stripeGet<{ data?: StripeSubscription[] }>(
    "subscriptions",
    { status, limit: "100", "expand[]": "data.items.data.price" },
    fetchImpl
  );
  return payload.data ?? [];
}

async function fetchPaidInvoices(createdGte: number, fetchImpl: typeof fetch): Promise<StripeInvoice[]> {
  const payload = await stripeGet<{ data?: StripeInvoice[] }>(
    "invoices",
    { status: "paid", limit: "100", "created[gte]": String(createdGte) },
    fetchImpl
  );
  return payload.data ?? [];
}

async function stripeGet<T>(
  path: string,
  params: Record<string, string>,
  fetchImpl: typeof fetch
): Promise<T> {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY is required");

  const url = new URL(`https://api.stripe.com/v1/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Stripe API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }
  return (await response.json()) as T;
}

function subscriptionMonthlyMinor(sub: StripeSubscription): number {
  const items = sub.items?.data ?? [];
  return items.reduce((total, item) => total + itemMonthlyMinor(item), 0);
}

function itemMonthlyMinor(item: StripeSubscriptionItem): number {
  const price = item.price;
  if (!price || !price.recurring) return 0;
  const quantity = item.quantity ?? 1;
  const amount = (price.unit_amount ?? 0) * quantity;
  const intervalCount = price.recurring.interval_count ?? 1;
  if (intervalCount <= 0) return 0;

  switch (price.recurring.interval) {
    case "month":
      return amount / intervalCount;
    case "year":
      return amount / (12 * intervalCount);
    case "week":
      return (amount * 52) / (12 * intervalCount);
    case "day":
      return (amount * 365) / (12 * intervalCount);
    default:
      return 0;
  }
}

function buildTopAccounts(subs: StripeSubscription[], limit: number): TopAccount[] {
  const byCustomer = new Map<string, TopAccount>();
  for (const sub of subs) {
    const customerId = sub.customer || "unknown";
    const existing = byCustomer.get(customerId) ?? {
      customerId,
      monthlyAmount: 0,
      subscriptionCount: 0
    };
    existing.monthlyAmount += subscriptionMonthlyMinor(sub);
    existing.subscriptionCount += 1;
    byCustomer.set(customerId, existing);
  }
  return [...byCustomer.values()]
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
    .slice(0, limit);
}

function normalizeCurrency(sub: StripeSubscription): string | null {
  if (sub.currency) return sub.currency;
  const price = sub.items?.data?.[0]?.price;
  return price?.currency ?? null;
}

function dominantCurrency(currencies: string[]): string | null {
  if (currencies.length === 0) return null;
  const counts = new Map<string, number>();
  for (const currency of currencies) {
    counts.set(currency, (counts.get(currency) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = -1;
  for (const [currency, count] of counts) {
    if (count > bestCount) {
      best = currency;
      bestCount = count;
    }
  }
  return best;
}

export function observeRevenue(revenue: RevenueKpis): KpiObservation[] {
  const observations: KpiObservation[] = [];

  if (revenue.mixedCurrencies) {
    observations.push({
      area: "revenue",
      severity: "watch",
      observation:
        "Subscriptions span multiple currencies. MRR is summed without conversion, so treat the totals as approximate and segment by currency before reporting."
    });
  }

  const churnRatio = revenue.mrr > 0 ? revenue.churnedMrr / revenue.mrr : 0;
  if (churnRatio > 0.05) {
    observations.push({
      area: "revenue",
      severity: "action",
      observation:
        "Churned MRR is more than 5% of current MRR this window. Review cancellation reasons and at-risk accounts. No subscriptions were changed."
    });
  } else if (revenue.churnedSubscriptions > 0) {
    observations.push({
      area: "revenue",
      severity: "watch",
      observation:
        "Some subscriptions churned this window. Confirm whether they were voluntary or failed-payment churn before drawing conclusions."
    });
  }

  if (revenue.newSubscriptions === 0) {
    observations.push({
      area: "revenue",
      severity: "watch",
      observation: "No new subscriptions started in this window. Check acquisition and checkout funnels."
    });
  }

  const topMonthly = revenue.topAccounts[0]?.monthlyAmount ?? 0;
  if (revenue.mrr > 0 && topMonthly / revenue.mrr > 0.25) {
    observations.push({
      area: "revenue",
      severity: "watch",
      observation:
        "A single account is more than 25% of MRR. Flag the revenue-concentration risk to the operator."
    });
  }

  observations.push({
    area: "revenue",
    severity: "info",
    observation:
      "Compare this digest against last week's saved snapshot to report expansion and contraction MRR. This run only reads Stripe and makes no changes."
  });

  return observations;
}

// --- PostHog product KPIs ----------------------------------------------------------------

interface EventCount {
  event: string;
  count: number;
}

export async function readProductKpis(
  asOf: string,
  windowDays: number,
  limit: number,
  fetchImpl: typeof fetch = fetch
): Promise<ProductKpis> {
  // Windows are half-open on the end: [since, until) using whole UTC days.
  const currentUntil = shiftDate(asOf, 1);
  const currentSince = shiftDate(currentUntil, -windowDays);
  const comparisonUntil = currentSince;
  const comparisonSince = shiftDate(comparisonUntil, -windowDays);

  const current: DateRange = { since: currentSince, until: currentUntil };
  const comparison: DateRange = { since: comparisonSince, until: comparisonUntil };

  const [currentCounts, previousCounts] = await Promise.all([
    fetchEventCounts(current, limit, fetchImpl),
    fetchEventCounts(comparison, limit, fetchImpl)
  ]);

  const totalEvents = sumCounts(currentCounts);
  const previousTotalEvents = sumCounts(previousCounts);

  return {
    current,
    comparison,
    totalEvents,
    previousTotalEvents,
    totalEventsChangePct: percentChange(totalEvents, previousTotalEvents),
    topEvents: mergeTrends(currentCounts, previousCounts, totalEvents, limit)
  };
}

async function fetchEventCounts(
  range: DateRange,
  limit: number,
  fetchImpl: typeof fetch
): Promise<EventCount[]> {
  const query =
    `SELECT event, count() AS total FROM events ` +
    `WHERE timestamp >= toDateTime('${range.since} 00:00:00') ` +
    `AND timestamp < toDateTime('${range.until} 00:00:00') ` +
    `GROUP BY event ORDER BY total DESC LIMIT ${limit}`;

  const rows = await runHogQLQuery(query, fetchImpl);
  return rows.map((row) => ({
    event: String(row[0] ?? "unknown"),
    count: Number(row[1] ?? 0)
  }));
}

async function runHogQLQuery(query: string, fetchImpl: typeof fetch): Promise<unknown[][]> {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Error("POSTHOG_API_KEY and POSTHOG_PROJECT_ID are required");
  }
  const host = (process.env.POSTHOG_HOST ?? "https://us.posthog.com").replace(/\/$/, "");

  const response = await fetchImpl(`${host}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`PostHog query API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { results?: unknown };
  const results = Array.isArray(payload.results) ? payload.results : [];
  return results.map((row) => (Array.isArray(row) ? (row as unknown[]) : [row]));
}

function mergeTrends(
  current: EventCount[],
  previous: EventCount[],
  total: number,
  limit: number
): EventTrend[] {
  const previousByEvent = new Map(previous.map((item) => [item.event, item.count]));
  return current.slice(0, limit).map((item) => {
    const previousCount = previousByEvent.get(item.event) ?? 0;
    return {
      event: item.event,
      count: item.count,
      previousCount,
      changePct: percentChange(item.count, previousCount),
      shareOfTotalPct: total > 0 ? Math.round((item.count / total) * 1000) / 10 : null
    };
  });
}

export function observeProduct(product: ProductKpis): KpiObservation[] {
  const observations: KpiObservation[] = [];

  const totalChange = product.totalEventsChangePct;
  if (totalChange !== null && totalChange <= -25) {
    observations.push({
      area: "product",
      severity: "action",
      observation:
        `Total tracked events fell ${Math.abs(totalChange)}% versus the prior window. Investigate a possible tracking regression, release, or genuine usage decline.`
    });
  } else if (totalChange !== null && totalChange >= 50) {
    observations.push({
      area: "product",
      severity: "watch",
      observation:
        `Total tracked events rose ${totalChange}% versus the prior window. Confirm whether this reflects real growth or duplicate/instrumentation changes before celebrating.`
    });
  }

  for (const item of product.topEvents) {
    const material = item.count >= 50 || (item.shareOfTotalPct ?? 0) >= 5;
    if (item.previousCount > 0 && item.count === 0) {
      observations.push({
        area: "product",
        severity: "action",
        observation:
          `"${item.event}" had ${item.previousCount} events last window but zero this window. Likely a broken or removed event; verify instrumentation.`
      });
    } else if (material && item.changePct !== null && item.changePct <= -25) {
      observations.push({
        area: "product",
        severity: "watch",
        observation:
          `"${item.event}" dropped ${Math.abs(item.changePct)}% versus the prior window. Check for a related release or tracking change.`
      });
    }
  }

  if (observations.length === 0) {
    observations.push({
      area: "product",
      severity: "info",
      observation:
        `Product usage is steady (${product.totalEvents} tracked events this window). No action needed. This run only reads PostHog and makes no changes.`
    });
  }

  return observations;
}

// --- shared helpers ----------------------------------------------------------------------

function sumCounts(items: EventCount[]): number {
  return items.reduce((acc, item) => acc + item.count, 0);
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function toMajor(minor: number): number {
  return Math.round((minor / 100) * 100) / 100;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function optionalInteger(value: unknown, field: string, min: number, max: number): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field} must be an integer between ${min} and ${max}.`);
  }
  return value;
}
