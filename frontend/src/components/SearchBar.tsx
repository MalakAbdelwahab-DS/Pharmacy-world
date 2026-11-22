"use client";

import { Mic, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { dictionaries, type Lang } from "@/lib/i18n";

// Figma "Search bar": white, 1.5px border-strong, radius 12, 16 x 12 padding, 20px icons, mic in a tint-blue circle.
// Header size is 52px tall; the home page uses the large size (64px tall, 24 x 20 padding).
function SearchBarInner({ lang, size }: { lang: Lang; size: "default" | "large" }) {
  const t = dictionaries[lang];
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const large = size === "large";

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length >= 2) router.push(`/${lang}/search/?q=${encodeURIComponent(q.trim())}`);
      }}
      className={`flex items-center gap-3 bg-white border-[1.5px] border-border-strong rounded-md w-full focus-within:border-2 focus-within:border-blue ${
        large ? "h-16 px-6" : "h-[52px] px-4"
      }`}
    >
      <Search size={20} strokeWidth={1.8} className="text-slate shrink-0" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.searchPlaceholder}
        aria-label={t.searchPlaceholder}
        dir="auto"
        className="flex-1 min-w-0 bg-transparent outline-none t-body text-ink placeholder:text-slate"
      />
      <button type="button" aria-label={t.voiceSearch} className="shrink-0 p-2 rounded-full bg-tint-blue text-blue">
        <Mic size={20} strokeWidth={1.8} aria-hidden />
      </button>
    </form>
  );
}

export function SearchBar({ lang, size = "default" }: { lang: Lang; size?: "default" | "large" }) {
  return (
    <Suspense>
      <SearchBarInner lang={lang} size={size} />
    </Suspense>
  );
}
