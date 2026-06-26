/* Pixel-art glyphs rendered with CSS box-shadow.
 * Pure functions — safe to import from both .astro (server) and .tsx (client). */

export const GL: Record<string, string[]> = {
  mag: [".OOO...", "O...O..", "O...O..", "O...O..", ".OOO...", "...OOO.", "....OOO"],
  code: [".......", "..O.O..", ".O...O.", "O.....O", ".O...O.", "..O.O..", "......."],
  out: ["O......", "OOO....", "OOOOO..", "OOOOOOO", "OOOOO..", "OOO....", "O......"],
  chat: ["OOOOOO.", "O....O.", "O....O.", "O....O.", "OOOOOO.", ".O.....", "O......"],
  content: [".....OO", "....OOO", "...OOO.", "..OOO..", ".OOO...", "OOO....", "OO....."],
  bug: ["..O.O..", ".OOOOO.", "OO.O.OO", ".OOOOO.", "OO.O.OO", ".OOOOO.", "O.....O"],
  rev: ["...O...", ".OOOOO.", "O.O....", ".OOOO..", "....O.O", ".OOOOO.", "...O..."],
  docs: ["OOOOOO.", "O....O.", "O.OO.O.", "O....O.", "O.OO.O.", "O....O.", "OOOOOO."],
  social: ["OO...OO", "OO...OO", "..O.O..", "...O...", "..OOO..", "..OOO..", "......."],
  deploy: ["...O...", "..OOO..", ".OOOOO.", "OOOOOOO", "...O...", "...O...", "...O..."],
  bars: [".....O.", ".....O.", "...O.O.", "...O.O.", ".O.O.O.", ".O.O.O.", ".O.O.O."],
  gear: ["...O...", "O..O..O", ".O.O.O.", "..OOO..", ".O.O.O.", "O..O..O", "...O..."],
  env: ["OOOOOOO", "OO...OO", "O.O.O.O", "O..O..O", "O.....O", "O.....O", "OOOOOOO"],
};

export interface GlyphStyle {
  w: number;
  h: number;
  scale: number;
  boxShadow: string;
}

export function glyphStyle(key: string, color: string, scale = 4): GlyphStyle {
  const grid = GL[key] ?? GL.gear;
  const shadows: string[] = [];
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "O") shadows.push(`${x * scale}px ${y * scale}px 0 0 ${color}`);
    }
  }
  return { w: 7 * scale, h: 7 * scale, scale, boxShadow: shadows.join(",") };
}
