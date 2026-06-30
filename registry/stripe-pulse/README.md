# Stripe Revenue & Churn Pulse

## What it does

Pulls revenue and churn facts from Stripe, cross-references at-risk customers against their PostHog product engagement, and writes a grounded pulse where every number traces back to retrieved data and anything it cannot find is flagged as missing rather than guessed.

## Setup

Provide a restricted, read-only Stripe key and your PostHog CLI credentials, and connect Slack in Vercel so the agent can post. It authenticates through Vercel Connect, so it never sees a token.
