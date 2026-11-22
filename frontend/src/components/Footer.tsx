import Link from "next/link";

import { dictionaries, type Lang } from "@/lib/i18n";

// Figma "Footer": navy, 120 x 40 padding, brand in Label, links in Body small with 24px gaps
export function Footer({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  return (
    <footer className="bg-navy text-white">
      <div className="page py-10 flex flex-wrap items-center gap-6">
        <p className="flex-1 t-label">
          {t.brand} · {t.tagline}
        </p>
        <nav className="flex flex-wrap gap-6 t-body-sm">
          {t.footerLinks.map((label, i) => (
            <Link key={label} href={`/${lang}/${t.footerHrefs[i]}/`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
