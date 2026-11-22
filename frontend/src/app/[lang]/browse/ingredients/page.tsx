import { languages } from "@/lib/i18n";
import { IngredientsView } from "./IngredientsView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <IngredientsView lang={lang as "en" | "ar"} />;
}
