"use client";

import { Button } from "@/components/ui";
import { useApp, type MedicineContext } from "@/lib/store";

// Opens the AI assistant, optionally about one medicine
export function AskButton({
  medicine,
  style = "primary",
  children,
}: {
  medicine?: MedicineContext | null;
  style?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  const { openChat } = useApp();
  return (
    <Button style={style} onClick={() => openChat(medicine ?? null)}>
      {children}
    </Button>
  );
}
