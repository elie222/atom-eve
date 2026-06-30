# UX Reviewer

## What it does

Walks a real user task end to end in the browser, capturing one screenshot per screen along the natural path. It scores each screen 1 to 5 on clarity, effort, error prevention, and confidence, notes friction, copy, layout, affordance, and accessibility issues, then ranks the weakest screens and proposes prioritized, concrete improvements. You get a Markdown report with an executive summary, the task and screens walked, per-screen scores, weakest spots, recommendations, screenshots, and a follow-up test prompt.

## Setup

Set the user task and starting URL in the prompt, or point the agent at your local env/config notes. Tune `agent/instructions.md` for your product, primary tasks, and design heuristics. For authenticated apps, configure access in your own project and keep credentials out of this package.
