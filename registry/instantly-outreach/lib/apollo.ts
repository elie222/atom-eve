export interface IcpFilters {
  titles: string[];
  locations: string[];
  keywords: string | null;
  employeeRanges: string[];
  limit: number;
}

export interface ApolloLead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string | null;
  linkedinUrl: string | null;
}

// Pull ICP leads from Apollo's people search. Read-only: this only searches, it never enriches,
// saves, or contacts anyone. https://api.apollo.io/api/v1 with an X-Api-Key header.
export async function searchLeads(icp: IcpFilters, fetchImpl: typeof fetch = fetch): Promise<ApolloLead[]> {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) throw new Error("APOLLO_API_KEY is required");

  const body: Record<string, unknown> = {
    page: 1,
    per_page: icp.limit
  };
  if (icp.titles.length > 0) body.person_titles = icp.titles;
  if (icp.locations.length > 0) body.person_locations = icp.locations;
  if (icp.employeeRanges.length > 0) body.organization_num_employees_ranges = icp.employeeRanges;
  if (icp.keywords) body.q_keywords = icp.keywords;

  const response = await fetchImpl("https://api.apollo.io/api/v1/mixed_people/search", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Apollo API failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`);
  }

  const payload = (await response.json()) as { people?: Array<Record<string, unknown>> };
  const rows = payload.people ?? [];
  return rows.map((row) => {
    const organization = (row.organization ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      name: String(row.name ?? "Unknown"),
      title: String(row.title ?? ""),
      company: String(organization.name ?? ""),
      email: row.email == null ? null : String(row.email),
      linkedinUrl: row.linkedin_url == null ? null : String(row.linkedin_url)
    };
  });
}

// Dedupe within a pull by email, then LinkedIn URL, then Apollo id. The tool also surfaces a hint
// to persist results across runs so the operator does not re-contact people in a later campaign.
export function dedupeLeads(leads: ApolloLead[]): ApolloLead[] {
  const seen = new Set<string>();
  const unique: ApolloLead[] = [];
  for (const lead of leads) {
    const key = (lead.email || lead.linkedinUrl || lead.id || "").trim().toLowerCase();
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    unique.push(lead);
  }
  return unique;
}
