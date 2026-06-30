# Backlink Prospector

## What it does

Queries DataForSEO for domains that link to configured competitors but not to your domain, then checks each prospect for context, fit, contact paths, and obvious disqualifiers. It exports a CSV with the referring domain, competitor evidence, prospect notes, contact URL or email, status, and next action so a human can run outreach from a spreadsheet.

It verifies contact forms and email addresses but does not submit forms or send outreach.

## Setup

Create DataForSEO API credentials with Backlinks API access. Configure your domain, competitor domains, daily prospect target, and any exclusion rules in `agent/instructions.md` or the scheduled prompt.
