import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Header } from "@/components/Header";
import { dictionaries, dir, isLang, languages } from "@/lib/i18n";
import "../globals.css";

export const metadata: Metadata = {
  title: "Pharmacy World",
  description: "Medicine information for Jordan, in Arabic and English.",
};

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dictionaries[lang];

  return (
    <html lang={lang} dir={dir(lang)}>
      <body className="min-h-screen flex flex-col">
        <Header lang={lang} />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10">{children}</main>
        <footer className="bg-navy text-white">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 text-sm">
            {t.brand} · {t.tagline}
          </div>
        </footer>
      </body>
    </html>
  );
}
