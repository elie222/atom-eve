const ATOM_EVE_BANNER = `
 █████╗ ████████╗ ██████╗ ███╗   ███╗    ███████╗██╗   ██╗███████╗
██╔══██╗╚══██╔══╝██╔═══██╗████╗ ████║    ██╔════╝██║   ██║██╔════╝
███████║   ██║   ██║   ██║██╔████╔██║    █████╗  ██║   ██║█████╗
██╔══██║   ██║   ██║   ██║██║╚██╔╝██║    ██╔══╝  ╚██╗ ██╔╝██╔══╝
██║  ██║   ██║   ╚██████╔╝██║ ╚═╝ ██║    ███████╗ ╚████╔╝ ███████╗
╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝    ╚══════╝  ╚═══╝  ╚══════╝
`.replace(/^\n/, "").replace(/\n$/, "");
const EVE_BANNER_START_COLUMN = 41;
const BANNER_WIDTH = Math.max(...ATOM_EVE_BANNER.split("\n").map((line) => [...line].length));

// Sampled top-to-bottom from the homepage logo: ATOM fades light pink → rose →
// magenta → purple, EVE light cyan → sky → blue → royal blue.
const ATOM_STOPS = [
  [241, 171, 221],
  [228, 83, 158],
  [183, 56, 160],
  [172, 52, 202]
] as const;
const EVE_STOPS = [
  [152, 232, 250],
  [95, 185, 230],
  [62, 130, 200],
  [53, 97, 226]
] as const;

export function printProjectBanner() {
  if (!process.stdout.isTTY || process.env.CI) return;

  // The block banner is BANNER_WIDTH columns wide; narrower terminals would wrap
  // it mid-glyph, so fall back to a one-line wordmark in the same colors.
  const columns = process.stdout.columns ?? 80;
  const banner = columns >= BANNER_WIDTH ? colorizeBanner(ATOM_EVE_BANNER) : compactBanner();

  console.log("");
  console.log(banner);
  console.log("");
}

function colorizeBanner(banner: string): string {
  if (process.env.NO_COLOR) return banner;

  const lines = banner.split("\n");

  return lines
    .map((line, lineIndex) =>
      [...line]
        .map((char, index) => {
          if (char === " ") return char;
          const stops = index >= EVE_BANNER_START_COLUMN ? EVE_STOPS : ATOM_STOPS;
          const position = lineIndex / Math.max(1, lines.length - 1);
          const [red, green, blue] = interpolateColor(stops, position);
          return `\x1b[38;2;${red};${green};${blue}m${char}`;
        })
        .join("") + "\x1b[0m"
    )
    .join("\n");
}

function compactBanner(): string {
  if (process.env.NO_COLOR) return "ATOM EVE";
  return `${gradientText("ATOM", ATOM_STOPS)} ${gradientText("EVE", EVE_STOPS)}`;
}

function gradientText(text: string, stops: readonly (readonly [number, number, number])[]): string {
  const chars = [...text];
  return (
    chars
      .map((char, index) => {
        const position = chars.length <= 1 ? 0 : index / (chars.length - 1);
        const [red, green, blue] = interpolateColor(stops, position);
        return `\x1b[38;2;${red};${green};${blue}m${char}`;
      })
      .join("") + "\x1b[0m"
  );
}

function interpolateColor(stops: readonly (readonly [number, number, number])[], position: number): [number, number, number] {
  const scaled = position * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const start = stops[index]!;
  const end = stops[index + 1]!;

  return [
    Math.round(start[0] + (end[0] - start[0]) * mix),
    Math.round(start[1] + (end[1] - start[1]) * mix),
    Math.round(start[2] + (end[2] - start[2]) * mix)
  ];
}
