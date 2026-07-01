function useColor(): boolean {
  return !process.env.NO_COLOR && Boolean(process.stdout.isTTY);
}

function paint(code: string, text: string): string {
  return useColor() ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export const bold = (text: string) => paint("1", text);
export const dim = (text: string) => paint("2", text);
export const cyan = (text: string) => paint("36", text);
export const green = (text: string) => paint("32", text);
