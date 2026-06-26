import { useMemo, useState } from "react";
import { installCommand, targetLabel } from "../lib/format";

interface Props {
  name: string;
  targets: string[];
}

const ACC = "#54f0a8";

/* "install with <framework>" tabs + copyable command (arcade terminal). */
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
    <div
      id="install"
      className="mt-[26px] border-2 border-edge bg-code"
      style={{ boxShadow: "5px 5px 0 rgba(0,0,0,0.4)" }}
    >
      <div className="flex flex-wrap items-center gap-[9px] border-b-2 border-edgedim px-4 py-[11px]">
        <span className="mr-1 font-pixel text-[8px] tracking-[0.06em] text-dim">INSTALL WITH</span>
        {frameworks.map((t) => {
          const on = t === active;
          return (
            <button
              key={t}
              onClick={() => {
                setActive(t);
                setCopied(false);
              }}
              className="cursor-pointer px-[11px] py-[5px] font-mono text-[12px] font-semibold transition-colors"
              style={{
                color: on ? "#0b0820" : "#9587bd",
                background: on ? ACC : "transparent",
                border: `2px solid ${on ? ACC : "#2a1a4a"}`,
              }}
            >
              {label(t)}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-[14px] px-[18px] py-4">
        <span className="font-mono text-[15px] text-green">$</span>
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[14px] text-ink">
          {cmds[active]}
        </span>
        <button
          onClick={copy}
          className="arcade-btn flex-none cursor-pointer whitespace-nowrap px-[13px] py-[10px] font-pixel text-[8px] leading-[1.5] tracking-[0.04em] text-[#0b0820]"
          style={{ background: ACC, boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
        >
          {copied ? "COPIED ✓" : "COPY"}
        </button>
      </div>
    </div>
  );
}
