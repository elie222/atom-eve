import { promises as fs } from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("../../..", import.meta.url).pathname);
const out = path.join(root, "apps", "web", "dist");
const index = JSON.parse(await fs.readFile(path.join(root, "public", "index.json"), "utf8"));

await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(path.join(out, "agents"), { recursive: true });

const cards = index.items
  .map(
    (item) => `<article class="card">
  <div class="meta">${escapeHtml(item.family)} / ${escapeHtml(item.category)}</div>
  <h2><a href="/agents/${item.name}/">${escapeHtml(item.title)}</a></h2>
  <p>${escapeHtml(item.descriptor)}</p>
  <code>npx atomeve add ${escapeHtml(item.name)}</code>
  <div class="badges">${item.targets.map((target) => `<span>${escapeHtml(target)}</span>`).join("")}</div>
</article>`
  )
  .join("\n");

await fs.writeFile(
  path.join(out, "index.html"),
  layout("Atom Eve", `<section class="hero"><h1>An agent for every job</h1><p>Install real Eve and Flue agent source into your own repo.</p></section><main class="grid">${cards}</main>`)
);

for (const item of index.items) {
  const readme = await fs.readFile(path.join(root, item.repoPath, "README.md"), "utf8");
  const body = `<p><a href="/">Back to catalog</a></p>
<h1>${escapeHtml(item.title)}</h1>
<p>${escapeHtml(item.descriptor)}</p>
<pre><code>npx atomeve add ${escapeHtml(item.name)}</code></pre>
<h2>Targets</h2>
<p>${item.targets.map(escapeHtml).join(", ")}</p>
<h2>Required Env</h2>
<p>${item.requiredEnv.length ? item.requiredEnv.map((env) => `<code>${escapeHtml(env)}</code>`).join(" ") : "None"}</p>
<h2>README</h2>
<pre class="readme">${escapeHtml(readme)}</pre>`;
  const dir = path.join(out, "agents", item.name);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), layout(item.title, body));
}

function layout(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body{margin:0;background:#101114;color:#f4f1e8;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
    a{color:#7dd3fc} .hero{padding:56px 24px 24px;max-width:1120px;margin:auto}
    h1{font-size:48px;margin:0 0 12px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;max-width:1120px;margin:0 auto;padding:24px}
    .card{border:1px solid #2e3340;border-radius:8px;padding:18px;background:#171a21}.meta{color:#a8b3cf;font-size:12px;text-transform:uppercase;letter-spacing:.08em}
    code,pre{background:#0a0b0f;border:1px solid #303642;border-radius:6px;padding:3px 6px}pre{overflow:auto;padding:16px}.badges span{display:inline-block;margin:10px 8px 0 0;border:1px solid #475569;border-radius:999px;padding:2px 8px}
    main:not(.grid){max-width:880px;margin:auto;padding:32px 24px}.readme{white-space:pre-wrap}
  </style>
</head>
<body>${body}<footer style="max-width:1120px;margin:40px auto;padding:24px;color:#a8b3cf">Community project. Not affiliated with or endorsed by Vercel, Eve, Cloudflare, or Flue.</footer></body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
