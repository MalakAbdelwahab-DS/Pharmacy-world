"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonClass } from "@/components/ui";
import { dictionaries, type Lang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

// Small bar that appears once medicines are added with "+ Compare"
export function CompareBar({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const { compare, clearCompare } = useApp();
  const pathname = usePathname();
  if (compare.length === 0 || pathname.includes("/compare")) return null;

  return (
    <div className="fixed z-30 bottom-8 start-8 flex pointer-events-none">
      <div className="pointer-events-auto bg-navy text-white rounded-full shadow-[var(--shadow-float)] ps-6 pe-2 py-2 flex items-center gap-4">
        <button type="button" onClick={clearCompare} className="t-label text-white/80">
          {t.clear}
        </button>
        <Link href={`/${lang}/compare/?ids=${compare.join(",")}`} className={buttonClass("primary", "!bg-white !text-blue")}>
          {t.compareBar(compare.length)}
        </Link>
      </div>
    </div>
  );
}
