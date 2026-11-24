"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Logo } from "@/components/Logo";
import { SearchBar } from "@/components/SearchBar";
import { buttonClass } from "@/components/ui";
import { dictionaries, type Lang } from "@/lib/i18n";
import { useApp } from "@/lib/store";

// Figma "Header": 120px side margins, 24px vertical padding, 24px gaps.
// No search bar on the home page and the sign-in pages. Signed in: a 36px profile circle replaces "Sign in".
function HeaderInner({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  const pathname = usePathname();
  const params = useSearchParams();
  const { user } = useApp();
  const noSearch = /^\/(en|ar)\/?$/.test(pathname) || /\/account\/(sign-in|create-account)/.test(pathname);
  const other: Lang = lang === "en" ? "ar" : "en";
  const query = params.toString();
  const switchHref = pathname.replace(/^\/(en|ar)/, `/${other}`) + (query ? `?${query}` : "");

  return (
    <header className="page py-6 flex flex-wrap items-center justify-between gap-6">
      <Logo lang={lang} />
      {!noSearch && (
        <div className="order-last w-full lg:order-none lg:w-auto lg:flex-1">
          <SearchBar lang={lang} />
        </div>
      )}
      <div className="flex items-center gap-4">
        <Link href={`/${lang}/about/`} className={buttonClass("ghost")}>
          {t.aboutLink}
        </Link>
        <Link href={switchHref} lang={other} className={buttonClass("ghost")}>
          {t.otherLanguage}
        </Link>
        {user ? (
          <Link
            href={`/${lang}/account/saved/`}
            aria-label={t.myAccount}
            className="size-9 rounded-full bg-tint-blue text-blue t-label flex items-center justify-center"
          >
            {user.name.trim().charAt(0).toUpperCase()}
          </Link>
        ) : (
          <Link href={`/${lang}/account/sign-in/`} className={buttonClass("primary")}>
            {t.signIn}
          </Link>
        )}
      </div>
    </header>
  );
}

export function Header({ lang }: { lang: Lang }) {
  return (
    <Suspense fallback={<div className="h-[100px]" />}>
      <HeaderInner lang={lang} />
    </Suspense>
  );
}
