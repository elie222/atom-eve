import {
  generateCreative as generate,
  normalizeGenerateCreativeInput,
  type GenerateCreativeInput
} from "../../lib/agents/creative-studio/fal.js";

export async function generateCreative(input: GenerateCreativeInput) {
  return generate(normalizeGenerateCreativeInput(input));
}
