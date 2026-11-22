import { languages } from "@/lib/i18n";
import { SavedView } from "./SavedView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <SavedView lang={lang as "en" | "ar"} />;
}
