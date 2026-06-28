export interface CreativeVariant {
  url: string;
  width: number | null;
  height: number | null;
  contentType: string | null;
}

export interface CreativeStudioDraft {
  generatedAt: string;
  mode: "read_only_draft";
  brief: string;
  model: string;
  requestedCount: number;
  variants: CreativeVariant[];
  approvalHint: string;
}

const DEFAULT_MODEL = "fal-ai/flux/schnell";
const DEFAULT_COUNT = 3;

export const generateCreativeInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["brief"],
  properties: {
    brief: {
      type: "string",
      minLength: 1,
      description: "Creative brief / image prompt describing the ad or social creative to generate."
    },
    count: {
      type: "integer",
      minimum: 1,
      maximum: 4,
      description: "Number of image variants to generate. Defaults to 3."
    }
  }
} as const;

export interface GenerateCreativeInput {
  brief: string;
  count?: number;
}

export function normalizeGenerateCreativeInput(input: unknown): GenerateCreativeInput {
  if (input === undefined || input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Creative Studio input must be an object with a brief.");
  }

  const value = input as Record<string, unknown>;
  const brief = typeof value.brief === "string" ? value.brief.trim() : "";
  if (!brief) {
    throw new Error("brief is required and must be a non-empty string.");
  }

  return { brief, count: optionalCount(value.count) };
}

export async function generateCreative(
  input: GenerateCreativeInput,
  fetchImpl: typeof fetch = fetch
): Promise<CreativeStudioDraft> {
  const parsed = normalizeGenerateCreativeInput(input);
  const count = parsed.count ?? DEFAULT_COUNT;

  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY is required");
  const model = process.env.FAL_MODEL ?? DEFAULT_MODEL;

  const response = await fetchImpl(`https://fal.run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: parsed.brief, num_images: count })
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`fal.ai API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { images?: Array<Record<string, unknown>> };
  const variants = (payload.images ?? []).map((image) => ({
    url: String(image.url ?? ""),
    width: image.width == null ? null : Number(image.width),
    height: image.height == null ? null : Number(image.height),
    contentType: image.content_type == null ? null : String(image.content_type)
  }));

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    brief: parsed.brief,
    model,
    requestedCount: count,
    variants,
    approvalHint:
      "Present these image variants with a short rationale for each and let the operator pick before publishing. Do not publish or push any creative to an ad platform or social account automatically."
  };
}

function optionalCount(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 4) {
    throw new Error("count must be an integer between 1 and 4.");
  }
  return value;
}
