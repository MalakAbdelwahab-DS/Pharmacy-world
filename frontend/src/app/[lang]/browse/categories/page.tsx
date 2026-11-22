import { languages } from "@/lib/i18n";
import { CategoriesView } from "./CategoriesView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <CategoriesView lang={lang as "en" | "ar"} />;
}
