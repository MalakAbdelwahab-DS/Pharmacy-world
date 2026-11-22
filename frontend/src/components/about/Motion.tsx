"use client";

import { useEffect, useRef, useState } from "react";

// Becomes true once the element scrolls into view (and stays true)
function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Fades and slides its content up when it scrolls into view
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Counts up to a number when it scrolls into view. Non-numbers (placeholders) are shown as they are.
export function CountUp({ value }: { value: string }) {
  const target = /^\d+$/.test(value) ? Number(value) : null;
  const { ref, inView } = useInView<HTMLSpanElement>(0.5);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || target === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    const start = performance.now();
    const duration = 1400;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return <span ref={ref}>{target === null ? value : shown.toLocaleString("en")}</span>;
}

// Timeline whose gold line fills as you scroll through it
export function Timeline({ items }: { items: { year: string; title: string; text: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the top reaches 85% of the screen, 1 when the bottom reaches 55%
      const p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <ol ref={ref} className="relative grid gap-10 md:grid-cols-3 md:gap-6">
      {/* Track and fill: vertical on mobile, horizontal on desktop */}
      <span className="absolute start-[11px] top-2 bottom-2 w-[3px] rounded-full bg-tint-blue md:hidden" aria-hidden />
      <span
        className="absolute start-[11px] top-2 w-[3px] rounded-full bg-gold md:hidden"
        style={{ height: `calc((100% - 16px) * ${progress})` }}
        aria-hidden
      />
      <span className="hidden md:block absolute top-[11px] inset-x-0 h-[3px] rounded-full bg-tint-blue" aria-hidden />
      <span
        className="hidden md:block absolute top-[11px] start-0 h-[3px] rounded-full bg-gold"
        style={{ width: `${progress * 100}%` }}
        aria-hidden
      />
      {items.map((item, i) => {
        const reached = progress >= (items.length === 1 ? 0 : i / (items.length - 1)) - 0.02;
        return (
          <li key={i} className="relative ps-12 md:ps-0 md:pt-12 flex flex-col gap-1">
            <span
              className={`absolute start-0 top-0 size-[25px] rounded-full border-[3px] transition-all duration-500 ${
                reached ? "bg-gold border-gold scale-110 shadow-[0_0_0_6px_rgba(236,176,76,0.25)]" : "bg-white border-tint-blue"
              }`}
              aria-hidden
            />
            <span className={`t-label transition-colors duration-500 ${reached ? "text-blue" : "text-slate"}`}>{item.year}</span>
            <h3 className="t-h3 text-ink">{item.title}</h3>
            <p className="t-body-sm text-slate">{item.text}</p>
          </li>
        );
      })}
    </ol>
  );
}

// Navy panel with a soft gold light that follows the cursor
export function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={`group relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(420px circle at var(--x) var(--y), rgba(236,176,76,0.22), transparent 60%)" }}
        aria-hidden
      />
      {children}
    </div>
  );
}
