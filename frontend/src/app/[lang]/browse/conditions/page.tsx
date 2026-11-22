import { languages } from "@/lib/i18n";
import { ConditionsView } from "./ConditionsView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <ConditionsView lang={lang as "en" | "ar"} />;
}
