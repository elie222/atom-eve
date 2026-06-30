# Accessibility Auditor

## What it does

Opens your configured pages in a real browser, injects axe-core, and runs it against each page. Findings are grouped by user harm (keyboard operability, screen reader and semantics, low vision and text scaling, color contrast, motion and timing) and ordered by severity within each group. You get a Markdown report with the page URL, the WCAG success criterion, the affected element, a screenshot for significant issues, and a concrete proposed fix, plus deltas from the prior run when history is available.

It proposes fixes only: it never edits source, opens pull requests, or deploys.

## Setup

List the pages to audit and your accessibility target (usually WCAG 2.2 AA) in `agent/instructions.md`, along with any known product constraints.
