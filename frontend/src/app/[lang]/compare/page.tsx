import { languages } from "@/lib/i18n";
import { CompareView } from "./CompareView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <CompareView lang={lang as "en" | "ar"} />;
}
