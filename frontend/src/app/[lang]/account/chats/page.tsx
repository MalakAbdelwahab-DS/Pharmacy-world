import { languages } from "@/lib/i18n";
import { ChatsView } from "./ChatsView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <ChatsView lang={lang as "en" | "ar"} />;
}
