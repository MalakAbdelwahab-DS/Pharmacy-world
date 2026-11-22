import { languages } from "@/lib/i18n";
import { ConditionView } from "./ConditionView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <ConditionView lang={lang as "en" | "ar"} />;
}
