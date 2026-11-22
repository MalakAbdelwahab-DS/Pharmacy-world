"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/Logo";
import { SearchBar } from "@/components/SearchBar";
import { buttonClass } from "@/components/ui";
import { dictionaries, type Lang } from "@/lib/i18n";

// Figma "Header": 120px side margins, 24px vertical padding, 24px gaps.
// The home page has no search bar in the header (the search is in the hero).
export function Header({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const pathname = usePathname();
  const isHome = /^\/(en|ar)\/?$/.test(pathname);
  const other: Lang = lang === "en" ? "ar" : "en";
  const switchHref = pathname.replace(/^\/(en|ar)/, `/${other}`) + (typeof window !== "undefined" ? window.location.search : "");

  return (
    <header className="page py-6 flex flex-wrap items-center justify-between gap-6">
      <Logo lang={lang} />
      {!isHome && (
        <div className="order-last w-full lg:order-none lg:w-auto lg:flex-1">
          <SearchBar lang={lang} />
        </div>
      )}
      <div className="flex items-center gap-4">
        <Link href={switchHref} lang={other} className={buttonClass("ghost")}>
          {t.otherLanguage}
        </Link>
        <Link href={`/${lang}/`} className={buttonClass("primary")}>
          {t.signIn}
        </Link>
      </div>
    </header>
  );
}
