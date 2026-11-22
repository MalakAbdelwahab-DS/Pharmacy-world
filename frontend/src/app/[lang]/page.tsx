import { SearchBar } from "@/components/SearchBar";
import { dictionaries, isLang, languages } from "@/lib/i18n";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return null;
  const t = dictionaries[lang];

  return (
    <section className="bg-white rounded-lg shadow-[var(--shadow-tile)] p-8 md:p-16 max-w-3xl mx-auto text-center">
      <h1 className="text-4xl md:text-5xl font-semibold text-navy">{t.heroTitle}</h1>
      <p className="mt-4 text-slate text-lg">{t.heroText}</p>
      <div className="mt-8 text-start">
        <SearchBar lang={lang} />
      </div>
    </section>
  );
}
