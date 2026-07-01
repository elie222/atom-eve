# Accessibility Auditor

## What it does

Finds the accessibility problems on your pages and hands you a fix-it-today list, grouped by the harm they cause real users.

Opens each configured page in a real browser, runs axe-core against it, and groups findings by user harm:
- keyboard operability
- screen reader and semantics
- low vision and text scaling
- color contrast
- motion and timing

You get a Markdown report ordered by severity within each group, each finding with the page URL, the WCAG success criterion, the affected element, a screenshot for significant issues, and a concrete proposed fix, plus deltas from the prior run when history is available.

## Setup

List the pages to audit and your accessibility target (usually WCAG 2.2 AA) in `agent/instructions.md`, along with any known product constraints.
