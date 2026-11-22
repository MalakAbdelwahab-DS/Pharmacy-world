import { languages } from "@/lib/i18n";
import { SearchResults } from "./SearchResults";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <SearchResults lang={lang as "en" | "ar"} />;
}
