"use client";

import { BadgePercent, BookOpen, Languages, Mic, Pill, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type Demo = {
  example: string;
  medicine: string;
  tabs: string[];
  rows: string[];
  lowest: string;
  verified: string;
  reference: string;
  lastUpdated: string;
  question: string;
};

const icons = [BookOpen, BadgePercent, ShieldCheck, Languages];
const DURATION = 6000;

// Skeleton line that draws itself in
function Line({ w, delay = 0, tone = "bg-tint-slate" }: { w: string; delay?: number; tone?: string }) {
  return (
    <span className={`block h-2.5 rounded-full ${tone} origin-[0%] rtl:origin-[100%] animate-[grow-x_700ms_ease-out_both]`} style={{ width: w, animationDelay: `${delay}ms` }} />
  );
}

function KnowDemo({ d }: { d: Demo }) {
  const [tab, setTab] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTab((x) => (x + 1) % d.tabs.length), 1400);
    return () => clearInterval(id);
  }, [d.tabs.length]);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="size-12 rounded-md bg-tint-blue text-blue flex items-center justify-center">
          <Pill size={24} strokeWidth={1.8} aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="t-h3 text-ink">{d.medicine}</span>
          <Line w="120px" />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {d.tabs.map((name, i) => (
          <span key={name} className={`px-3 py-1 rounded-full t-label transition-colors duration-300 ${i === tab ? "bg-blue text-white" : "bg-mist text-slate"}`}>
            {name}
          </span>
        ))}
      </div>
      <div key={tab} className="flex flex-col gap-3">
        <Line w="92%" />
        <Line w="78%" delay={120} />
        <Line w="85%" delay={240} />
        <Line w="55%" delay={360} />
      </div>
    </div>
  );
}

function PriceDemo({ d }: { d: Demo }) {
  const widths = ["48%", "71%", "94%"];
  return (
    <div className="flex flex-col gap-4">
      {d.rows.map((name, i) => (
        <div key={name} className={`rounded-md p-4 flex flex-col gap-2 ${i === 0 ? "bg-tint-green" : "bg-mist"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="t-label text-ink">{name}</span>
            {i === 0 && <span className="px-2.5 py-0.5 rounded-full bg-exact text-white t-caption animate-[pop_400ms_900ms_ease-out_both]">{d.lowest}</span>}
          </div>
          <span
            className={`block h-3 rounded-full origin-[0%] rtl:origin-[100%] animate-[grow-x_900ms_cubic-bezier(.2,.8,.2,1)_both] ${i === 0 ? "bg-exact" : "bg-border-strong"}`}
            style={{ width: widths[i], animationDelay: `${i * 150}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

function VerifiedDemo({ d }: { d: Demo }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="relative size-28 rounded-full bg-tint-green flex items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-exact animate-[ping-soft_1.8s_ease-out_infinite]" aria-hidden />
        <svg viewBox="0 0 48 48" className="size-16 text-exact" fill="none" aria-hidden>
          <path d="M24 4 L40 10 V22 C40 32 33 40 24 44 C15 40 8 32 8 22 V10 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <path d="M16 24 L22 30 L33 18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30" className="animate-[draw_700ms_400ms_ease-out_both]" />
        </svg>
      </span>
      <span className="px-3 py-1 rounded-full bg-tint-green text-exact t-label">{d.verified}</span>
      <div className="w-full flex flex-col gap-3 text-start">
        {[d.reference, d.lastUpdated].map((label, i) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-md bg-mist px-4 py-3">
            <span className="t-body-sm text-slate">{label}</span>
            <Line w="40%" delay={600 + i * 150} tone="bg-border-strong" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguageDemo({ d }: { d: Demo }) {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTyped((x) => (x >= d.question.length ? x : x + 1)), 55);
    return () => clearInterval(id);
  }, [d.question]);
  const done = typed >= d.question.length;
  return (
    <div className="flex flex-col gap-4">
      <div className="self-end max-w-[85%] rounded-lg rounded-ee-sm bg-blue text-white px-4 py-3 flex flex-col gap-2">
        <span className="flex items-center gap-2">
          <Mic size={16} aria-hidden />
          <span className="flex items-end gap-[3px] h-5" aria-hidden>
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="w-[3px] rounded-full bg-gold animate-[wave_900ms_ease-in-out_infinite]" style={{ animationDelay: `${(i * 70) % 600}ms`, height: "100%" }} />
            ))}
          </span>
        </span>
        <span className="t-body min-h-6" dir="auto">
          {d.question.slice(0, typed)}
          {!done && <span className="inline-block w-[2px] h-4 bg-white/80 align-middle ms-0.5 animate-pulse" />}
        </span>
      </div>
      <div className="self-start w-[80%] rounded-lg rounded-es-sm bg-mist px-4 py-4 flex flex-col gap-2.5">
        {done ? (
          <>
            <Line w="95%" tone="bg-border-strong" />
            <Line w="80%" delay={150} tone="bg-border-strong" />
            <Line w="60%" delay={300} tone="bg-border-strong" />
          </>
        ) : (
          <span className="flex gap-1.5 py-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2 rounded-full bg-slate animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export function FeatureShowcase({ items, demo }: { items: { title: string; text: string }[]; demo: Demo }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  const demos = [KnowDemo, PriceDemo, VerifiedDemo, LanguageDemo];
  const ActiveDemo = demos[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div role="tablist" aria-orientation="vertical" className="flex flex-col gap-3">
        {items.map((item, i) => {
          const Icon = icons[i];
          const on = i === active;
          return (
            <button
              key={item.title}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className={`relative overflow-hidden text-start rounded-lg p-5 flex gap-4 items-start transition-all duration-300 ${
                on ? "bg-white shadow-[var(--shadow-tile)]" : "hover:bg-white/60"
              }`}
            >
              <span className={`shrink-0 size-12 rounded-full flex items-center justify-center transition-colors duration-300 ${on ? "bg-gold text-navy" : "bg-tint-blue text-blue"}`}>
                <Icon size={22} strokeWidth={1.8} aria-hidden />
              </span>
              <span className="flex flex-col gap-1">
                <span className="t-h3 text-ink">{item.title}</span>
                <span className={`t-body-sm text-slate grid transition-all duration-300 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <span className="overflow-hidden">{item.text}</span>
                </span>
              </span>
              {on && !reduceMotion && (
                <span
                  key={active}
                  className="absolute bottom-0 start-0 h-[3px] bg-gold origin-[0%] rtl:origin-[100%] animate-[grow-x_linear_both]"
                  style={{ width: "100%", animationDuration: `${DURATION}ms`, animationPlayState: paused ? "paused" : "running" }}
                  onAnimationEnd={() => setActive((x) => (x + 1) % items.length)}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mock screen */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-gold/30 via-tint-blue to-blue/20 blur-2xl" aria-hidden />
        <div className="relative rounded-lg bg-white shadow-[var(--shadow-tile)] border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-mist">
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="ms-auto t-caption text-slate">{demo.example}</span>
          </div>
          <div key={active} role="tabpanel" className="p-6 md:p-8 min-h-[340px] animate-[fade-up_450ms_ease-out_both]">
            <ActiveDemo d={demo} />
          </div>
        </div>
      </div>
    </div>
  );
}
