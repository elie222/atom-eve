export interface HtmlAudit {
  url: string;
  finalUrl: string;
  status: number;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  h1: string[];
  links: string[];
  imagesMissingAlt: number;
  notes: string[];
}

export interface QaFinding {
  severity: "critical" | "major" | "minor" | "info";
  title: string;
  evidence: string;
  recommendation: string;
}

export async function fetchHtmlAudit(targetUrl: string, fetchImpl: typeof fetch = fetch): Promise<HtmlAudit> {
  const url = normalizeUrl(targetUrl);
  const response = await fetchImpl(url, {
    headers: {
      "user-agent": "atom-eve-website-qa/0.1"
    },
    redirect: "follow"
  });
  const html = await response.text();

  return {
    url,
    finalUrl: response.url || url,
    status: response.status,
    title: firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    metaDescription: firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i),
    canonical: firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i),
    h1: allMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(stripTags).filter(Boolean),
    links: allMatches(html, /<a[^>]+href=["']([^"']+)["'][^>]*>/gi).slice(0, 100),
    imagesMissingAlt: countImagesMissingAlt(html),
    notes: response.ok ? [] : [`HTTP status was ${response.status}`]
  };
}

export function analyzeHtmlAudit(audit: HtmlAudit): QaFinding[] {
  const findings: QaFinding[] = [];

  if (audit.status >= 400) {
    findings.push({
      severity: "critical",
      title: "Page returns an error status",
      evidence: `${audit.finalUrl} returned HTTP ${audit.status}.`,
      recommendation: "Fix the route or upstream error before deeper QA."
    });
  }

  if (!audit.title || audit.title.length < 10) {
    findings.push({
      severity: "major",
      title: "Missing or weak title tag",
      evidence: audit.title ? `Title is '${audit.title}'.` : "No title tag found.",
      recommendation: "Add a descriptive title that names the product/page and primary value."
    });
  }

  if (!audit.metaDescription || audit.metaDescription.length < 40) {
    findings.push({
      severity: "minor",
      title: "Missing or short meta description",
      evidence: audit.metaDescription ? `Description is ${audit.metaDescription.length} characters.` : "No meta description found.",
      recommendation: "Add a concise meta description for search and link previews."
    });
  }

  if (audit.h1.length !== 1) {
    findings.push({
      severity: "minor",
      title: "Unexpected H1 structure",
      evidence: `Found ${audit.h1.length} H1 elements.`,
      recommendation: "Use one clear H1 that describes the page."
    });
  }

  if (!audit.canonical) {
    findings.push({
      severity: "info",
      title: "No canonical URL found",
      evidence: "No rel=canonical link was detected in the initial HTML.",
      recommendation: "Add a canonical URL when duplicate or parameterized URLs are possible."
    });
  }

  if (audit.imagesMissingAlt > 0) {
    findings.push({
      severity: "minor",
      title: "Images may be missing alt text",
      evidence: `${audit.imagesMissingAlt} image tag(s) appear to have no alt attribute.`,
      recommendation: "Add alt text for meaningful images and empty alt attributes for decorative images."
    });
  }

  return findings;
}

export function renderQaReport(params: {
  url: string;
  checkedAt: string;
  audit: HtmlAudit;
  findings: QaFinding[];
  browserNotes?: string[];
  screenshots?: string[];
}): string {
  const findings = params.findings.length
    ? params.findings
        .map(
          (finding) => `### ${finding.severity.toUpperCase()}: ${finding.title}

Evidence: ${finding.evidence}

Recommendation: ${finding.recommendation}`
        )
        .join("\n\n")
    : "No blocking findings from the automated checks.";

  return `# Website QA Report

Target: ${params.url}
Checked: ${params.checkedAt}
Final URL: ${params.audit.finalUrl}
HTTP status: ${params.audit.status}

## Summary

Found ${params.findings.length} automated finding(s). Review browser notes and screenshots before shipping changes.

## What Was Checked

- Initial HTML response
- Title and meta description
- Canonical URL
- H1 structure
- Link extraction
- Image alt attribute presence
- Optional browser automation notes

## Findings

${findings}

## Browser Notes

${params.browserNotes?.length ? params.browserNotes.map((note) => `- ${note}`).join("\n") : "- Browser automation was not available or did not report notes."}

## Screenshots / Artifacts

${params.screenshots?.length ? params.screenshots.map((screenshot) => `- ${screenshot}`).join("\n") : "- No screenshots captured."}

## Follow-Up Test Ideas

- Run this audit on mobile and desktop viewports.
- Add product-specific routes and flows to the installed QA brief.
- Re-run after fixes and compare reports over time.
`;
}

function normalizeUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function firstMatch(html: string, pattern: RegExp): string | null {
  const match = pattern.exec(html);
  return match ? decodeHtml(stripTags(match[1] ?? "").trim()) : null;
}

function allMatches(html: string, pattern: RegExp): string[] {
  return [...html.matchAll(pattern)].map((match) => decodeHtml((match[1] ?? "").trim()));
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countImagesMissingAlt(html: string): number {
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  return images.filter((img) => !/\salt\s*=/i.test(img)).length;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
