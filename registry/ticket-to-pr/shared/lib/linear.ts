export interface LinearComment {
  author: string;
  body: string;
}

export interface LinearTicket {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  state: string | null;
  stateType: string | null;
  priority: string | null;
  url: string | null;
  assignee: string | null;
  labels: string[];
  comments: LinearComment[];
}

export interface LinearTicketReview {
  generatedAt: string;
  mode: "read_only_draft";
  ticket: LinearTicket;
  draftingHint: string;
}

export const reviewTicketInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ticketId"],
  properties: {
    ticketId: {
      type: "string",
      description:
        "Linear issue id or identifier to read, e.g. an issue UUID or a human key like ENG-123."
    }
  }
} as const;

export interface ReviewTicketInput {
  ticketId: string;
}

export function normalizeReviewTicketInput(input: unknown): ReviewTicketInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Ticket review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (typeof value.ticketId !== "string" || value.ticketId.trim() === "") {
    throw new Error("ticketId is required and must be a non-empty string.");
  }

  return { ticketId: value.ticketId.trim() };
}

const ISSUE_QUERY = `query Issue($id: String!) {
  issue(id: $id) {
    id
    identifier
    title
    description
    priorityLabel
    url
    state { name type }
    assignee { name }
    labels { nodes { name } }
    comments { nodes { body user { name } } }
  }
}`;

export async function reviewTicket(
  input: ReviewTicketInput,
  fetchImpl: typeof fetch = fetch
): Promise<LinearTicketReview> {
  const parsed = normalizeReviewTicketInput(input);
  const ticket = await fetchTicket(parsed.ticketId, fetchImpl);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    ticket,
    draftingHint:
      "Draft a reviewer-ready PR plan from this ticket: a reproduction (or root-cause hypothesis), a step-by-step implementation plan citing the files and modules likely involved, and a test plan covering the acceptance criteria. Present everything as a draft for operator approval. This tool only reads the ticket; it does not open, push, or merge a PR."
  };
}

export async function fetchTicket(
  ticketId: string,
  fetchImpl: typeof fetch = fetch
): Promise<LinearTicket> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error("LINEAR_API_KEY is required");

  const response = await fetchImpl("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey
    },
    body: JSON.stringify({ query: ISSUE_QUERY, variables: { id: ticketId } })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Linear API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  const payload = (await response.json()) as {
    data?: { issue?: Record<string, unknown> | null };
    errors?: Array<{ message?: unknown }>;
  };

  if (payload.errors && payload.errors.length > 0) {
    const message = payload.errors.map((error) => String(error.message ?? "")).join("; ");
    throw new Error(`Linear API returned errors: ${message}`);
  }

  const issue = payload.data?.issue;
  if (!issue) {
    throw new Error(`Linear ticket not found: ${ticketId}`);
  }

  return normalizeTicket(issue);
}

function normalizeTicket(issue: Record<string, unknown>): LinearTicket {
  const state = asRecord(issue.state);
  const assignee = asRecord(issue.assignee);
  const labels = asRecord(issue.labels);
  const comments = asRecord(issue.comments);

  return {
    id: String(issue.id ?? ""),
    identifier: String(issue.identifier ?? ""),
    title: String(issue.title ?? "Untitled ticket"),
    description: issue.description == null ? null : String(issue.description),
    state: state?.name == null ? null : String(state.name),
    stateType: state?.type == null ? null : String(state.type),
    priority: issue.priorityLabel == null ? null : String(issue.priorityLabel),
    url: issue.url == null ? null : String(issue.url),
    assignee: assignee?.name == null ? null : String(assignee.name),
    labels: nodeNames(labels?.nodes),
    comments: normalizeComments(comments?.nodes)
  };
}

function normalizeComments(nodes: unknown): LinearComment[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => {
    const record = asRecord(node) ?? {};
    const user = asRecord(record.user);
    return {
      author: user?.name == null ? "Unknown" : String(user.name),
      body: String(record.body ?? "")
    };
  });
}

function nodeNames(nodes: unknown): string[] {
  if (!Array.isArray(nodes)) return [];
  return nodes
    .map((node) => {
      const record = asRecord(node);
      return record?.name == null ? "" : String(record.name);
    })
    .filter((name) => name !== "");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}
