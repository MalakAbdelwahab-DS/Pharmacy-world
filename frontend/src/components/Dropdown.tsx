"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { buttonClass } from "@/components/ui";

// A filter button (Figma Secondary or Ghost button with ▾) that opens a list of options
export function Dropdown({
  label,
  options,
  selected,
  onToggle,
  style = "secondary",
  align = "start",
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  style?: "secondary" | "ghost";
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const active = style === "secondary" && selected.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={buttonClass(style, active ? "!bg-tint-blue" : "")}
      >
        {label}
        {active && ` (${selected.length})`} ▾
      </button>
      {open && (
        <div
          className={`absolute z-30 mt-2 min-w-[220px] max-h-80 overflow-y-auto bg-white rounded-md border border-border shadow-[var(--shadow-tile)] py-2 ${
            align === "end" ? "end-0" : "start-0"
          }`}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onToggle(o.value);
                if (style === "ghost") setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 t-body-sm text-ink text-start hover:bg-mist"
            >
              <span className="size-4 shrink-0 text-blue">{selected.includes(o.value) && <Check size={16} strokeWidth={2} />}</span>
              <bdi>{o.label}</bdi>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
