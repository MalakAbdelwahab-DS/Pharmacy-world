const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "pw_token";

export type MedicineCard = {
  id: number;
  trade_name_en: string;
  trade_name_ar: string | null;
  ingredients: string;
  strength_text: string;
  dosage_form: string;
  rx_status: "Rx" | "OTC" | null;
  status: "active" | "discontinued";
  sponsored: boolean;
  priority?: number | null;
  manufacturer: string | null;
  country: string | null;
  from_price: number | null;
  price_per_unit: number | null;
  unit_name: string | null;
  lower_price?: boolean;
};

export type Pack = {
  pack_size_text: string;
  unit_count: number | null;
  public_price: number | null;
  price_per_unit: number | null;
  unit_name: string | null;
  price_includes_vat: boolean | null;
};

export type ClinicalSection = {
  section: string;
  content_en: string | null;
  content_ar: string | null;
  reference: string;
  last_updated: string;
};

export type MedicineDetail = MedicineCard & {
  route: string | null;
  therapeutic_class: string | null;
  atc_code: string | null;
  packs: Pack[];
  clinical_sections: ClinicalSection[];
  categories: Named[];
  conditions: Named[];
};

export type SearchResponse = { query: string; total: number; results: MedicineCard[]; did_you_mean: string | null };
export type Alternatives = { same_medicine: MedicineCard[]; similar: MedicineCard[] };
export type Named = { slug: string; name_en: string; name_ar: string };
export type Category = Named & { text_en: string; text_ar: string; medicines: number; examples: string[] };
export type Condition = Named & { desc_en: string; desc_ar: string; medicines: number; examples: string[] };
export type ConditionChip = Named & { ids: number[] };
export type ListResponse = Named & {
  text_en?: string;
  text_ar?: string;
  desc_en?: string;
  desc_ar?: string;
  total: number;
  results: MedicineCard[];
  conditions: ConditionChip[];
};
export type Ingredient = { id: number; name_en: string; name_ar: string | null; medicines: number };
export type User = { id: number; name: string; email: string };
export type Source = { medicine_id: number; name: string; reference: string; last_updated: string | null };
export type AssistantKind = "answer" | "no_info" | "safety";
export type AssistantReply = { chat_id: number; kind: AssistantKind; text: string; sources: Source[] };
export type ChatSummary = { id: number; title: string; created_at: string; product_id: number | null; medicine: string | null; strength: string | null };
export type ChatMessage = { role: "user" | "assistant"; kind: AssistantKind | "question"; content: string; sources: Source[] };
export type ChatDetail = ChatSummary & { messages: ChatMessage[] };

export class ApiError extends Error {
  constructor(public status: number, public detail: unknown) {
    super(`${status}`);
  }
}

export const token = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (value: string | null) => {
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable: stay signed out */
    }
  },
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const t = token.get();
  if (t) headers.set("Authorization", `Bearer ${t}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = (await res.json()).detail;
    } catch {
      /* no body */
    }
    throw new ApiError(res.status, detail);
  }
  return res.json();
}

const body = (data: unknown) => JSON.stringify(data);

export const api = {
  search: (q: string) => request<SearchResponse>(`/medicines/search?q=${encodeURIComponent(q)}`),
  medicine: (id: string | number) => request<MedicineDetail>(`/medicines/${id}`),
  alternatives: (id: string | number) => request<Alternatives>(`/medicines/${id}/alternatives`),
  categories: () => request<Category[]>(`/categories`),
  category: (slug: string) => request<ListResponse>(`/categories/${encodeURIComponent(slug)}`),
  conditions: () => request<Condition[]>(`/conditions`),
  condition: (slug: string) => request<ListResponse>(`/conditions/${encodeURIComponent(slug)}`),
  ingredients: () => request<{ letters: string[]; items: Ingredient[] }>(`/ingredients`),

  register: (data: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>(`/auth/register`, { method: "POST", body: body(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>(`/auth/login`, { method: "POST", body: body(data) }),
  logout: () => request(`/auth/logout`, { method: "POST" }),
  me: () => request<User>(`/auth/me`),

  saved: () => request<MedicineCard[]>(`/me/saved`),
  save: (id: number) => request(`/me/saved/${id}`, { method: "PUT" }),
  unsave: (id: number) => request(`/me/saved/${id}`, { method: "DELETE" }),
  chats: () => request<ChatSummary[]>(`/me/chats`),
  chat: (id: number) => request<ChatDetail>(`/me/chats/${id}`),

  ask: (data: { question: string; medicine_id?: number | null; chat_id?: number | null }) =>
    request<AssistantReply>(`/assistant/ask`, { method: "POST", body: body(data) }),
  photo: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ found: string[] }>(`/search/photo`, { method: "POST", body: form });
  },
};
