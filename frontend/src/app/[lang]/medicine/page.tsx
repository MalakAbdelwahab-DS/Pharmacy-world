import { languages } from "@/lib/i18n";
import { MedicineView } from "./MedicineView";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function MedicinePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <MedicineView lang={lang as "en" | "ar"} />;
}
