import { useState } from "react";

interface Props {
  readmeHtml: string;
  manifestHtml: string;
}

type Tab = "readme" | "manifest";

/* README.md / atom.json switcher for the agent detail page. */
export default function ContentTabs({ readmeHtml, manifestHtml }: Props) {
  const [tab, setTab] = useState<Tab>("readme");

  const tabStyle = (on: boolean) => ({
    color: on ? "#eef0ff" : "#7177a3",
    borderBottom: `2px solid ${on ? "#9bff5c" : "transparent"}`,
    marginBottom: "-1px",
  });

  return (
    <div className="min-w-0">
      <div className="mb-6 flex gap-[6px] border-b border-edge">
        <button
          onClick={() => setTab("readme")}
          className="cursor-pointer px-[14px] py-[10px] font-mono text-[13px]"
          style={tabStyle(tab === "readme")}
        >
          README.md
        </button>
        <button
          onClick={() => setTab("manifest")}
          className="cursor-pointer px-[14px] py-[10px] font-mono text-[13px]"
          style={tabStyle(tab === "manifest")}
        >
          atom.json
        </button>
      </div>

      {tab === "readme" ? (
        <div className="md" dangerouslySetInnerHTML={{ __html: readmeHtml }} />
      ) : (
        <pre
          className="m-0 overflow-x-auto rounded-[10px] border border-edge bg-code p-[18px] font-mono text-[12.5px] leading-[1.7] text-ink2"
          dangerouslySetInnerHTML={{ __html: manifestHtml }}
        />
      )}
    </div>
  );
}
