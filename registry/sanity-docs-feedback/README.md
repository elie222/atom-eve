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
