# Creative Studio Agent

## What it does

Generates ad and social image creative variants from a brief using [fal.ai](https://fal.ai) image models. It is draft-first: from a single brief it produces a small set of image variants and returns their URLs as drafts, with a short rationale for each, so an operator can pick before anything ships. The agent does not publish, schedule, or push creative to any ad platform or social account on its own.

The only custom tool is a small fal.ai image-generation reader that posts the brief to a fal.run model endpoint and returns the resulting image URLs.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add creative-studio
```

Target overrides:

```bash
npx atom-eve add creative-studio --target eve
npx atom-eve add creative-studio --target flue
```

## Setup

Create a fal.ai API key from your fal.ai dashboard.

Required environment variables:

```bash
FAL_KEY=...
```

Optional environment variables:

```bash
# Override the fal.ai image model. Defaults to fal-ai/flux/schnell.
FAL_MODEL=fal-ai/flux/schnell
```

Configure these variables in your local shell and in any deployment environment that runs the agent.

## Usage

Run the agent on demand with a creative brief. There is no schedule or workflow because creative generation is an on-demand task.

- Eve installs as the root agent under `agent/`, including the `generate_creative` tool.
- Flue installs an agent plus the creative tool under `src/tools/creative-studio/`.

Give the agent a brief (prompt text plus an optional `count` of 1-4 variants). It calls the fal.ai model, then returns the image URLs as drafts with a rationale for each variant. Review the variants and publish approved creative yourself, or add your own write/publish tool.

## Connections and auth

This package uses a custom fal.ai tool with env-token auth because image generation is outside the framework-native toolset. The tool calls `https://fal.run/<model>` with an `Authorization: Key ${FAL_KEY}` header. The key is read by the installed project at runtime.

## Limitations

- The reference implementation only generates images and returns their URLs; it does not publish, schedule, or push creative to any ad platform or social account.
- Generated images live at the URLs fal.ai returns. Download and store anything you intend to keep, since hosted URLs can expire.
- Brief quality drives output quality. Provide a clear prompt, audience, and channel in the brief.
- Always review drafted variants and rights/brand-safety before using any creative in production.
