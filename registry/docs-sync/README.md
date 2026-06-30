# Docs Sync

## What it does

Reads recent merged pull requests, changed files, public APIs, CLI commands, config schemas, examples, and existing docs. It identifies stale or missing documentation, then drafts concrete edits, a PR title, and a PR body grounded in the code changes.

## Setup

Create a GitHub token with read access to repository contents, pull requests, releases, and issues if docs requests are tracked there. Configure the target repository, docs paths, source paths, and any release or changelog window in `agent/instructions.md` or the scheduled prompt.
