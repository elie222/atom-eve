import { useMemo, useState } from "react";
import { installCommand, targetLabel } from "../lib/format";

interface Props {
  name: string;
  targets: string[];
}

/* "install with <framework>" tabs + copyable command. */
export default function InstallBox({ name, targets }: Props) {
  const frameworks = targets.length ? targets : ["npm"];
  const cmds = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of frameworks) map[t] = installCommand(name, t === "npm" ? undefined : t);
    return map;
  }, [name, frameworks]);

  const [active, setActive] = useState(frameworks[0]);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(cmds[active]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const label = (t: string) => (t === "npm" ? "npm" : targetLabel(t));

  return (
    <div id="install" className="mt-[26px] overflow-hidden rounded-[10px] border border-edge bg-code">
      <div className="flex items-center gap-[9px] border-b border-edgedim px-4 py-[11px]">
        <span className="mr-[2px] font-mono text-[11px] text-dim">install with</span>
        {frameworks.map((t) => {
          const on = t === active;
          return (
            <button
              key={t}
              onClick={() => {
                setActive(t);
                setCopied(false);
              }}
              className="cursor-pointer rounded-[5px] px-[11px] py-1 font-mono text-[12px] transition-colors"
              style={{
                color: on ? "#0a0a0c" : "#8b91c0",
                background: on ? "#9bff5c" : "transparent",
                border: `1px solid ${on ? "#9bff5c" : "#262c47"}`,
              }}
            >
              {label(t)}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-[14px] px-[18px] py-[17px]">
        <span className="font-mono text-[15px] text-eve">$</span>
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[14.5px] text-ink">
          {cmds[active]}
        </span>
        <button
          onClick={copy}
          className="cursor-pointer whitespace-nowrap rounded-md border-none bg-eve px-4 py-2 text-[13px] font-semibold text-[#0a0a0c]"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
