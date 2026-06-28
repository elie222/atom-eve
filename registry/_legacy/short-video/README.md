# Short Video Agent

## What it does

Turns a long transcript, recording, or topic into a plan of short vertical clips (Reels, Shorts, TikToks). The agent segments the supplied transcript into self-contained moments, or ideates clip angles when only a topic is given, and for each clip proposes a scroll-stopping hook, an on-screen caption, and a short rationale for why the moment works on its own.

It is draft-first: every clip comes back as an operator-ready draft, and the agent does not cut, render, or publish anything. The only custom tool is a pure, network-free clip planner.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add short-video
```

Target overrides:

```bash
npx atom-eve add short-video --target eve
npx atom-eve add short-video --target flue
```

## Setup

Create a [fal](https://fal.ai) API key from your fal dashboard. The agent reads it only to confirm credentials are configured; a render/clip tool you add later would use it to drive the fal pipeline.

Required environment variables:

```bash
FAL_KEY=...
```

Configure this variable in your local shell and in the deployment environment that runs the agent.

## Usage

This agent runs on demand: there is no schedule or workflow. Run it manually and supply a transcript or a topic.

- Eve installs as the root agent under `agent/`, with the clip planner at `agent/tools/plan_clips.ts`.
- Flue installs an agent at `src/agents/short-video.ts` plus the clip planner under `src/tools/short-video/`.

Paste a transcript (or name a topic) and ask for a clip plan. The agent returns suggested clip segments, each with a hook, caption, and rationale. Refine the drafts in your own voice, confirm the source timestamps, and cut or publish the approved clips yourself, or add your own write tool that calls fal.

## Connections and auth

This package uses a custom fal tool with env-token auth because fal's media pipeline is outside the framework-native toolset. The `FAL_KEY` is read by the installed project at runtime to report whether credentials are configured; the reference clip planner itself does not call fal.

## Limitations

- Cutting real clips needs the source media and the fal pipeline, so the reference tool is a pure, network-free planner. It segments the supplied transcript (or ideates around a topic) and drafts hooks, captions, and rationale; it does not call fal, render, or produce media.
- Hooks and captions are heuristic starting points generated from the text you provide. Rewrite them in your own voice before recording or cutting.
- Timestamps and exact in/out points are not derived from media; confirm them against the real recording before producing clips.
- Rendering, cutting, and publishing are intentionally left to the operator or a write tool you add yourself.
