# Thumbnail Studio Agent

## What it does

Iterates YouTube and social thumbnail concepts for a topic using [fal.ai](https://fal.ai) image generation, then self-scores each concept against a clarity and no-clickbait bar so an operator can approve the strongest one.

It is draft-first and read-only: the agent generates concept images and returns their URLs alongside a self-scored rationale (clarity and clickbait risk per concept). It never publishes, uploads, or sets a thumbnail anywhere. The only custom tool is a small fal.ai image client.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add thumbnail-studio
```

Target overrides:

```bash
npx atom-eve add thumbnail-studio --target eve
npx atom-eve add thumbnail-studio --target flue
```

## Setup

Create a fal.ai API key from your fal.ai dashboard with access to image models. The reference client calls the `fal-ai/flux/schnell` text-to-image endpoint.

Required environment variables:

```bash
FAL_KEY=...
```

Configure this variable in your local shell and in the deployment environment that runs the agent.

## Usage

Run the agent on demand and give it a topic. There is no schedule or workflow; this agent is invoked when you need thumbnail concepts.

- Eve installs as the root agent under `agent/`, with the tool at `agent/tools/generate_thumbnails.ts`.
- Flue installs an agent at `src/agents/thumbnail-studio.ts` plus the tool at `src/tools/thumbnail-studio/fal.ts`.

Ask for concepts for a topic, optionally with a count (1-6):

```text
Generate 3 thumbnail concepts for "How to bake sourdough bread at home".
Score each for clarity and clickbait risk and tell me which clear the bar.
```

The `generate_thumbnails` tool produces distinct concept angles (direct, how-to, numbered, question, outcome, comparison), generates an image per angle with fal.ai, and returns each concept with its image URL and a self-score. Review the returned URLs and rationale, then approve and publish a thumbnail yourself.

## Connections and auth

This package uses a custom fal.ai tool with env-token auth because the fal.ai image endpoint is outside the framework-native toolset. The `FAL_KEY` is read by the installed project at runtime and sent as an `Authorization: Key <FAL_KEY>` header.

## Limitations

- The reference implementation generates images and scores headline copy heuristically; it does not view the rendered pixels, so clarity is judged on the headline text and angle, not on the actual image.
- Image generation is a real network call to fal.ai and consumes credits each run. Keep `count` small while iterating.
- Concept headlines are short, topic-anchored starting points meant for operator refinement, not final on-image copy.
- The agent never publishes, uploads, or sets a thumbnail. Always review concepts and pick/finalize the thumbnail yourself.
