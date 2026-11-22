import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatButton } from "@/components/ChatButton";
import { ChatPanel } from "@/components/ChatPanel";
import { CompareBar } from "@/components/CompareBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { dir, isLang, languages } from "@/lib/i18n";
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

  return (
    <html lang={lang} dir={dir(lang)}>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header lang={lang} />
          <main className="flex-1 w-full">{children}</main>
          <Footer lang={lang} />
          <CompareBar lang={lang} />
          <ChatPanel lang={lang} />
          <ChatButton lang={lang} />
        </Providers>
      </body>
    </html>
  );
}
