import { notFound } from "next/navigation";

import { dictionaries, isLang, languages } from "@/lib/i18n";

// "about" has its own page in /about
const pages = ["disclaimer", "privacy", "contact"] as const;
type InfoPage = (typeof pages)[number];

export function generateStaticParams() {
  return languages.flatMap((lang) => pages.map((info) => ({ lang, info })));
}

// Footer pages (About, Disclaimer, Privacy, Contact). Not designed in Figma yet: a simple white tile.
export default async function Info({ params }: { params: Promise<{ lang: string; info: string }> }) {
  const { lang, info } = await params;
  if (!isLang(lang) || !pages.includes(info as InfoPage)) notFound();
  const page = dictionaries[lang].infoPages[info as InfoPage];
  return (
    <div className="page pt-8 pb-20">
      <article className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-8 max-w-[760px] flex flex-col gap-4">
        <h1 className="t-h1 text-ink">{page.title}</h1>
        <p className="t-body text-ink">{page.text}</p>
      </article>
    </div>
  );
}
