# UX Reviewer

## What it does

Gives you a per-screen usability scorecard of a key user task, with prioritized fixes for the weakest spots. It walks the task end to end in a real browser and, for each screen:

- captures one screenshot along the natural path
- scores it 1 to 5 on clarity, effort, error prevention, and confidence
- notes friction, copy, layout, affordance, and accessibility issues

It then ranks the weakest screens and proposes concrete improvements. You get a Markdown report with an executive summary, the task and screens walked, per-screen scores, weakest spots, recommendations, screenshots, and a follow-up test prompt.

## Setup

Set the user task, starting URL, and your design heuristics in `agent/instructions.md`.
