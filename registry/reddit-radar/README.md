# Reddit Radar Agent

## What it does

Monitors target subreddits and keywords for threads where your project can add genuine value, ranks the matches by fit (keyword and topic match) and reach (score and comment volume), and drafts short, non-spammy replies for operator approval. It is draft-first and read-only: every reply comes back as a draft with its target thread link, and the agent does not post anything on its own.

Reply voice and persuasion come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `copywriting` skill, which the installer pulls from skills.sh at install time. The only custom tool is a small Reddit reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add reddit-radar
```

Target overrides:

```bash
npx atom-eve add reddit-radar --target eve
npx atom-eve add reddit-radar --target flue
```

## Setup

Create a Reddit "script" app at https://www.reddit.com/prefs/apps to get a client id and secret. The reader uses application-only OAuth (the `client_credentials` grant), so it needs only the app credentials and a descriptive user agent for read-only access to public threads. No Reddit account password is required.

Required environment variables:

```bash
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USER_AGENT=your-app-name/1.0 by your-reddit-username
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

The installer also pulls the shared `coreyhaines31/marketingskills@copywriting` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@copywriting
```

## Usage

Run the agent manually to scan your subreddits and keywords, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts`.
- Flue installs an agent plus `src/workflows/reddit-radar-daily.ts`.

The agent searches the configured subreddits for your keywords, ranks the matching threads by fit and reach, and uses the copywriting skill to draft a short, helpful reply for the top threads. Review and post approved drafts on Reddit yourself, or add your own write tool.

## Connections and auth

This package uses a custom Reddit tool with env-token auth because Reddit search is outside the framework-native toolset. The app credentials are read by the installed project at runtime and exchanged for a short-lived read-only OAuth token via `https://www.reddit.com/api/v1/access_token`.

If you prefer not to register a script app, you can adapt the reader to call the public `https://www.reddit.com/r/<sub>/search.json` endpoint with the same `REDDIT_USER_AGENT` header instead of the OAuth flow. The public endpoint is unauthenticated, more heavily rate-limited, and requires a descriptive user agent to avoid 429s.

## Limitations

- The reference implementation is read-only: it only searches and ranks threads. It does not post comments, send messages, or change anything on Reddit.
- Ranking is a simple keyword-fit plus log-scaled reach heuristic; tune the weights and thresholds for your niche.
- Reddit's search is keyword-based and recency-biased, so very new or niche threads may be missed. Reddit also rate-limits aggressively; keep the subreddit list and `limit` modest.
- Always review drafted replies for tone, accuracy, and subreddit rules before posting. Lead with value and disclose any affiliation honestly to stay non-spammy.
