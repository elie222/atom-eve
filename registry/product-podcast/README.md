# Product Podcast Agent

## What it does

Turns recent product updates into a short, source-grounded podcast episode for [ElevenLabs](https://elevenlabs.io) text-to-speech. The agent gathers your recent update notes (changelog entries, shipped features, fixes), drafts an episode outline with per-segment talking points, and writes the spoken script grounded only in those notes. It is draft-first: the episode comes back as an operator-ready script plus an audio plan, and the agent does not generate audio or publish anything on its own.

The only custom tool is a pure, network-free episode planner. It scaffolds the outline and reports whether `ELEVENLABS_API_KEY` is configured so you know if the later text-to-speech step is ready.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add product-podcast
```

Target overrides:

```bash
npx atom-eve add product-podcast --target eve
npx atom-eve add product-podcast --target flue
```

## Setup

Create an ElevenLabs API key from your ElevenLabs account settings. The agent reads it to confirm credentials are configured; a text-to-speech tool you add later would use it to synthesize the approved script.

Required environment variables:

```bash
ELEVENLABS_API_KEY=...
```

Optionally set `ELEVENLABS_VOICE_ID` to the voice you want the later TTS step to use.

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually with this week's update notes, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts`.
- Flue installs an agent plus `src/workflows/product-podcast-weekly.ts`.

The agent calls the `plan_episode` tool with your update notes to draft the episode outline and audio plan, then writes each segment's spoken script grounded only in those notes. Review the approved script and synthesize the audio with ElevenLabs yourself, or add your own text-to-speech tool.

## Connections and auth

This package uses a custom ElevenLabs tool with env-token auth because ElevenLabs is a text-to-speech (write) service that is outside the framework-native toolset. The `ELEVENLABS_API_KEY` is read by the installed project at runtime only to confirm credentials are configured; the planner itself does not call ElevenLabs.

## Limitations

- ElevenLabs offers text-to-speech (a write action) rather than a clean read endpoint, so the reference tool is a pure, network-free planner. It drafts the episode outline and audio plan; it does not call ElevenLabs or produce audio.
- Generating audio and publishing the episode are intentionally left to the operator or a text-to-speech tool you add yourself.
- Always review the drafted script for accuracy against your real update notes before synthesizing or publishing anything.
