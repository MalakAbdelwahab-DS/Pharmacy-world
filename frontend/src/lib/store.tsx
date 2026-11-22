"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { api, token, type AssistantKind, type ChatMessage, type Source, type User } from "@/lib/api";

export type MedicineContext = { id: number; name: string };
export type PanelMessage = { role: "user" | "assistant"; kind: AssistantKind | "question" | "thinking"; content: string; sources: Source[] };

type ChatState = {
  open: boolean;
  medicine: MedicineContext | null;
  chatId: number | null;
  messages: PanelMessage[];
};

type AppState = {
  user: User | null;
  userLoaded: boolean;
  signIn: (t: string, u: User) => void;
  signOut: () => void;

  compare: number[];
  toggleCompare: (id: number) => void;
  clearCompare: () => void;

  chat: ChatState;
  openChat: (medicine?: MedicineContext | null) => void;
  closeChat: () => void;
  clearMedicine: () => void;
  ask: (question: string) => Promise<void>;
  loadChat: (chatId: number, medicine: MedicineContext | null, messages: ChatMessage[]) => void;
};

const AppContext = createContext<AppState | null>(null);
const COMPARE_KEY = "pw_compare";
const MAX_COMPARE = 3;

const emptyChat: ChatState = { open: false, medicine: null, chatId: null, messages: [] };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [compare, setCompare] = useState<number[]>([]);
  const [chat, setChat] = useState<ChatState>(emptyChat);

  useEffect(() => {
    try {
      setCompare(JSON.parse(localStorage.getItem(COMPARE_KEY) ?? "[]"));
    } catch {
      setCompare([]);
    }
    if (!token.get()) {
      setUserLoaded(true);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => token.set(null))
      .finally(() => setUserLoaded(true));
  }, []);

  const saveCompare = (ids: number[]) => {
    setCompare(ids);
    try {
      localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
    } catch {
      /* per-visitor convenience only */
    }
  };

  const signIn = useCallback((t: string, u: User) => {
    token.set(t);
    setUser(u);
  }, []);

  const signOut = useCallback(() => {
    api.logout().catch(() => undefined);
    token.set(null);
    setUser(null);
    setChat(emptyChat);
  }, []);

  const toggleCompare = (id: number) => {
    if (compare.includes(id)) saveCompare(compare.filter((x) => x !== id));
    else saveCompare([...compare, id].slice(-MAX_COMPARE));
  };

  const openChat = useCallback((medicine?: MedicineContext | null) => {
    setChat((c) => {
      const sameMedicine = medicine === undefined || medicine?.id === c.medicine?.id;
      return sameMedicine
        ? { ...c, open: true }
        : { open: true, medicine: medicine ?? null, chatId: null, messages: [] };
    });
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q) return;
      const current = chat;
      setChat((c) => ({
        ...c,
        open: true,
        messages: [
          ...c.messages,
          { role: "user", kind: "question", content: q, sources: [] },
          { role: "assistant", kind: "thinking", content: "", sources: [] },
        ],
      }));
      try {
        const reply = await api.ask({ question: q, medicine_id: current.medicine?.id ?? null, chat_id: current.chatId });
        setChat((c) => ({
          ...c,
          chatId: reply.chat_id,
          messages: [...c.messages.slice(0, -1), { role: "assistant", kind: reply.kind, content: reply.text, sources: reply.sources }],
        }));
      } catch {
        setChat((c) => ({
          ...c,
          messages: [...c.messages.slice(0, -1), { role: "assistant", kind: "no_info", content: "", sources: [] }],
        }));
      }
    },
    [chat],
  );

  const loadChat = useCallback((chatId: number, medicine: MedicineContext | null, messages: ChatMessage[]) => {
    setChat({ open: true, medicine, chatId, messages: messages.map((m) => ({ ...m, sources: m.sources ?? [] })) });
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        userLoaded,
        signIn,
        signOut,
        compare,
        toggleCompare,
        clearCompare: () => saveCompare([]),
        chat,
        openChat,
        closeChat: () => setChat((c) => ({ ...c, open: false })),
        clearMedicine: () => setChat((c) => ({ ...c, medicine: null, chatId: null, messages: [] })),
        ask,
        loadChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

// Questions typed into the search bar go to the AI assistant instead of search
export function looksLikeQuestion(text: string) {
  const t = text.trim().toLowerCase();
  return (
    t.endsWith("?") ||
    t.endsWith("؟") ||
    /^(can|is|are|what|how|which|when|why|should|does|do|could|will)\b/.test(t) ||
    /^(هل|ما|ماذا|كيف|متى|لماذا|أي|كم)\s/.test(t)
  );
}
