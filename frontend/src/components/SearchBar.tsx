"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { dictionaries, type Lang } from "@/lib/i18n";

function SearchBarInner({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length >= 2) router.push(`/${lang}/search/?q=${encodeURIComponent(q.trim())}`);
      }}
      className="flex items-center gap-2 bg-white border border-border-input rounded-full ps-5 pe-1.5 py-1.5"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.searchPlaceholder}
        aria-label={t.searchPlaceholder}
        className="flex-1 bg-transparent outline-none text-base py-1.5"
      />
      <button type="submit" className="bg-blue text-white rounded-full px-5 py-2 text-sm font-medium">
        {t.search}
      </button>
    </form>
  );
}

export function SearchBar({ lang }: { lang: Lang }) {
  return (
    <Suspense>
      <SearchBarInner lang={lang} />
    </Suspense>
  );
}
