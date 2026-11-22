const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
  manufacturer: string | null;
  country: string | null;
  from_price: number | null;
  price_per_unit: number | null;
  unit_name: string | null;
  lower_price?: boolean;
};

export type Pack = {
  pack_size_text: string;
  public_price: number | null;
  price_per_unit: number | null;
  unit_name: string | null;
  price_includes_vat: boolean | null;
};

export type MedicineDetail = MedicineCard & { route: string | null; therapeutic_class: string | null; packs: Pack[] };

export type SearchResponse = { query: string; total: number; results: MedicineCard[]; did_you_mean: string | null };
export type Alternatives = { same_medicine: MedicineCard[]; similar: MedicineCard[] };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export const api = {
  search: (q: string) => get<SearchResponse>(`/medicines/search?q=${encodeURIComponent(q)}`),
  medicine: (id: string) => get<MedicineDetail>(`/medicines/${id}`),
  alternatives: (id: string) => get<Alternatives>(`/medicines/${id}/alternatives`),
};
