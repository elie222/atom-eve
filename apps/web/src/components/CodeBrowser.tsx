import { useMemo, useState } from "react";
import { FILE_GROUPS, type FileGroup } from "../lib/format";

interface AgentFile {
  target: string;
  name: string;
  content: string;
  html: string;
  group: FileGroup;
  lang: string;
}

interface AgentTargetFiles {
  target: string;
  files: AgentFile[];
}

interface Props {
  targets: AgentTargetFiles[];
}

const ACC = "#54f0a8";

/* Browse an agent's real installable source — instructions, tools, skills,
 * and the rest — grouped the way you'd think about them, with a per-file copy
 * so you can paste straight into your project (shadcn-style). */
export default function CodeBrowser({ targets }: Props) {
  const [activeTarget, setActiveTarget] = useState(targets[0]?.target ?? "");
  const current = targets.find((t) => t.target === activeTarget) ?? targets[0];
  const files = current?.files ?? [];

  const groups = useMemo(() => {
    const byGroup = new Map<FileGroup, AgentFile[]>();
    for (const file of files) {
      const list = byGroup.get(file.group) ?? [];
      list.push(file);
      byGroup.set(file.group, list);
    }
    return FILE_GROUPS.filter((g) => byGroup.has(g)).map((g) => ({
      group: g,
      files: byGroup.get(g)!,
    }));
  }, [files]);

  const [activePath, setActivePath] = useState(files[0]?.target ?? "");
  const active = files.find((f) => f.target === activePath) ?? files[0];

  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (active && navigator.clipboard) navigator.clipboard.writeText(active.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };


  const selectTarget = (target: string) => {
    setActiveTarget(target);
    const next = targets.find((t) => t.target === target);
    setActivePath(next?.files[0]?.target ?? "");
    setCopied(false);
  };

  if (!active) {
    return (
      <div className="border-2 border-edge bg-panel p-4 text-[13px] text-muted">
        No source files generated for this agent yet.
      </div>
    );
  }

  return (
    <div className="border-2 border-edge bg-code" style={{ boxShadow: "5px 5px 0 rgba(0,0,0,0.4)" }}>
      {/* header: target tabs + file count */}
      <div className="flex flex-wrap items-center gap-[10px] border-b-2 border-edgedim px-4 py-[11px]">
        <span className="mr-1 font-pixel text-[8px] tracking-[0.06em] text-dim">SOURCE</span>
        {targets.length > 1 && (
          <div className="flex border-2 border-edge bg-bg" role="tablist" aria-label="Source target">
            {targets.map((t) => {
              const on = t.target === activeTarget;
              return (
                <button
                  key={t.target}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => selectTarget(t.target)}
                  className="cursor-pointer border-r-2 border-edge px-[12px] py-[6px] font-mono text-[12px] font-semibold transition-colors last:border-r-0"
                  style={{ color: on ? "#0b0820" : "#9587bd", background: on ? ACC : "transparent" }}
                >
                  {t.target}
                </button>
              );
            })}
          </div>
        )}
        <span className="ml-auto font-mono text-[11px] text-dim">
          {files.length} file{files.length === 1 ? "" : "s"}
        </span>
      </div>

      {files.length <= 1 && targets.length > 1 && (
        <div className="border-b-2 border-edgedim px-4 py-[9px] font-mono text-[11.5px] text-muted">
          {activeTarget} ships fewer files here — this framework inlines instructions and logic into the
          agent file. Switch targets above to compare.
        </div>
      )}

      <div className="grid grid-cols-[230px_1fr] max-md:grid-cols-1">
        {/* file tree */}
        <div className="border-r-2 border-edgedim p-2 max-md:border-b-2 max-md:border-r-0">
          {groups.map(({ group, files: groupFiles }) => (
            <div key={group} className="mb-2">
              <div className="px-2 py-[6px] font-pixel text-[8px] tracking-[0.06em] text-dim">
                {group.toUpperCase()}
              </div>
              {groupFiles.map((file) => {
                const on = file.target === active.target;
                return (
                  <button
                    key={file.target}
                    type="button"
                    onClick={() => {
                      setActivePath(file.target);
                      setCopied(false);
                    }}
                    title={file.target}
                    className="flex w-full cursor-pointer items-center gap-2 px-2 py-[6px] text-left font-mono text-[12px] transition-colors"
                    style={{
                      color: on ? "#0b0820" : "#c2bbe0",
                      background: on ? ACC : "transparent",
                    }}
                  >
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* viewer */}
        <div className="min-w-0">
          <div className="flex items-center gap-3 border-b-2 border-edgedim px-4 py-[10px]">
            <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink2">{active.target}</code>
            <span className="hidden font-mono text-[10px] uppercase text-dim sm:inline">{active.lang}</span>
            <button
              type="button"
              onClick={copy}
              className="arcade-btn flex-none cursor-pointer whitespace-nowrap px-[11px] py-[7px] font-pixel text-[8px] leading-[1.5] tracking-[0.04em] text-[#0b0820]"
              style={{ background: ACC, boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}
            >
              {copied ? "COPIED ✓" : "COPY"}
            </button>
          </div>
          <div
            className="codeview max-h-[640px] overflow-auto"
            dangerouslySetInnerHTML={{ __html: active.html }}
          />
        </div>
      </div>
    </div>
  );
}
