"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchBar } from "@/components/SearchBar";
import { dictionaries, type Lang } from "@/lib/i18n";

export function Header({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const pathname = usePathname();
  const other: Lang = lang === "en" ? "ar" : "en";
  // Same page in the other language
  const switchHref = pathname.replace(/^\/(en|ar)/, `/${other}`);

  return (
    <header className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-5 flex flex-wrap items-center gap-4 md:gap-8">
      <Link href={`/${lang}/`} className="font-semibold text-lg text-navy shrink-0">
        {t.brand}
      </Link>
      <div className="flex-1 min-w-[240px]">
        <SearchBar lang={lang} />
      </div>
      <Link href={switchHref} lang={other} className="text-blue font-medium text-sm">
        {t.otherLanguage}
      </Link>
    </header>
  );
}
