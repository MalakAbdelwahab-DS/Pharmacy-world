import { languages } from "@/lib/i18n";
import { CategoryView } from "./CategoryView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <CategoryView lang={lang as "en" | "ar"} />;
}
