# Content Ideation

## What it does

Turns recent business context, such as product updates, customer calls, support themes, sales objections, metrics, and founder opinions, into YouTube topics, tweet and thread ideas, hooks, outlines, and approval-ready social copy. It checks any provided ideation history to avoid repeating angles, hooks, or claims, and returns the source context used, a repetition check, the ideas themselves, review copy for approvers, and notes on what to save for next time.

## Setup

Customize `agent/instructions.md` with your audience, channels, product language, and approval rules. Give the agent recent context each run, or point it at local notes; it can also read `mvanhorn/last30days-skill` output when that skill is installed. Persist approved and rejected items under `reports/content-ideation/history` so future runs avoid repeats.
