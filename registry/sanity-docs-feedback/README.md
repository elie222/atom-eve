# Sanity Docs Feedback

## What it does

Turns reader feedback on Sanity-powered docs into draft fixes an editor can review before publishing.

The external template:

- receives new feedback through a Sanity Function
- reads the referenced article and the feedback item
- stages a scoped draft edit with Sanity Agent Actions
- marks feedback as handled so retries and sweeps do not duplicate work
- posts a Slack review notice with a link back to Studio

Atom Eve lists this template for discovery only. It is maintained by Sanity Labs and is not installed by `npx atom-eve add`.

## Setup

Clone the upstream repo directly: `git clone https://github.com/sanity-labs/sanity-eve-docs-agent.git`.

Configure a Sanity project with the expected article and feedback document types.

Add a Sanity token that can read content and write drafts.

Connect Slack through Vercel Connect for review-ready notices.

Configure the Sanity Function trigger and shared trigger secret described in the upstream README.
