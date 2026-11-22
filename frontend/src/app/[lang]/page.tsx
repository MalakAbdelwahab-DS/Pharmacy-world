import { FlaskConical, HeartPulse, LayoutGrid } from "lucide-react";

import Link from "next/link";

import { AskButton } from "@/components/AskButton";
import { SearchBar } from "@/components/SearchBar";
import { Chip } from "@/components/ui";
import { dictionaries, isLang, languages } from "@/lib/i18n";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

const browseIcons = [LayoutGrid, FlaskConical, HeartPulse];

// Figma "Home page / Desktop / EN" (61:814)
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return null;
  const t = dictionaries[lang];

  return (
    <div className="page pb-20 flex flex-col gap-12">
      <section className="flex flex-col items-center gap-4 py-12 md:p-20 text-center">
        <h1 className="t-display text-ink">{t.heroTitle}</h1>
        <p className="t-body text-slate">{t.heroText}</p>
        <div className="w-full max-w-[720px] text-start">
          <SearchBar lang={lang} size="large" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="t-body text-slate">{t.popular}</span>
          {t.popularSearches.map((q) => (
            <Chip key={q} href={`/${lang}/search/?q=${encodeURIComponent(q)}`}>
              {q}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-4">
        <h2 className="t-h2 text-ink text-center">{t.browseTitle}</h2>
        <div className="grid w-full gap-6 md:grid-cols-3">
          {t.browseTiles.map((tile, i) => {
            const Icon = browseIcons[i];
            return (
              <Link
                key={tile.title}
                href={`/${lang}/${t.browseHrefs[i]}/`}
                className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-8 flex flex-col gap-3 items-start hover:ring-2 hover:ring-tint-blue"
              >
                <span className="size-[34px] rounded-full bg-tint-blue text-blue flex items-center justify-center">
                  <Icon size={20} strokeWidth={1.8} aria-hidden />
                </span>
                <h3 className="t-h3 text-ink">{tile.title}</h3>
                <p className="t-body-sm text-slate">{tile.text}</p>
                <span className="t-label text-blue">{t.explore}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-tint-blue rounded-lg p-8 flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[240px] flex flex-col gap-1">
          <h2 className="t-h3 text-ink">{t.aiTitle}</h2>
          <p className="t-body text-slate">{t.aiText}</p>
        </div>
        <AskButton style="secondary">{t.askQuestion}</AskButton>
      </section>
    </div>
  );
}
