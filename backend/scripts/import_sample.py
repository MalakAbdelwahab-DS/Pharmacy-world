"""Import the medicine spreadsheet, clean it, and report what is missing.

Usage:
    python scripts/import_sample.py data.xlsx                      # report only
    python scripts/import_sample.py data.xlsx --db postgresql://... # report + load

The report (docs/data_report.md) is the checklist for the full data.
"""

import argparse
import re
from collections import Counter
from pathlib import Path

import pandas as pd

COLUMNS = {
    "Trade Name (EN)": "trade_name_en",
    "Trade Name (AR)": "trade_name_ar",
    "Active Ingredient(s)": "ingredients",
    "Strength": "strength",
    "Dosage Form": "dosage_form",
    "Route": "route",
    "Pack Size": "pack_size",
    "Manufacturer": "manufacturer",
    "Country of Origin": "country",
    "Price": "price",
    "Currency": "currency",
    "Rx / OTC": "rx_status",
    "ATC Code": "atc_code",
    "Therapeutic Class": "therapeutic_class",
    "Registration No.": "registration_no",
    "Notes": "notes",
}

# Fields the website needs that the spreadsheet does not have yet.
MISSING_FIELDS = [
    ("Arabic ingredient names", "Ingredient pages and Arabic search"),
    ("Clinical sections (uses, dosage, side effects, warnings)", "Medicine page tabs and the AI assistant"),
    ("Reference and date for each clinical section", "Shown under every clinical section"),
    ("Structured usual adult dose (OTC only)", "Dosing timeline"),
    ("Status (active / discontinued)", "Discontinued medicine page"),
    ("Priority (paid placement)", "Sponsored order in search and categories"),
    ("Price includes VAT (yes / no)", "Public price label"),
    ("Pack photo", "Medicine cards and pages"),
    ("Public category (grouping of therapeutic classes)", "Browse by category"),
]


def clean_text(value):
    if pd.isna(value):
        return None
    text = re.sub(r"\s+", " ", str(value)).strip()
    return text or None


def split_ingredients(value):
    # "A + B", "A/B" (synonyms like Adrenaline/Epinephrine are kept as one name)
    parts = [p.strip() for p in str(value).split("+")]
    return [p for p in parts if p]


def parse_pack(text):
    """'30 tablet' -> (30, 'tablet'); '5 amp * 2 ml' -> (5, 'amp'); otherwise (None, None)."""
    m = re.match(r"^\s*(\d+(?:\.\d+)?)\s*([A-Za-z]+)", text or "")
    return (float(m.group(1)), m.group(2).lower()) if m else (None, None)


def load_sheet(path):
    df = pd.read_excel(path).rename(columns=COLUMNS)
    for col in df.columns:
        if col != "price":
            df[col] = df[col].map(clean_text)
    # Normalise case so "syrup" and "Syrup" are one form
    df["dosage_form"] = df["dosage_form"].str.capitalize()
    df["route"] = df["route"].map(lambda r: r if r is None or r.isupper() else r.capitalize())
    df["currency"] = df["currency"].replace({"JD": "JOD"})
    return df


def build_report(df, raw):
    n = len(df)
    lines = ["# Sample data report", "", f"Rows: {n} · Medicines (trade names): {df['trade_name_en'].nunique()}", ""]

    lines += ["## Empty values per column", "", "| Column | Empty | Of |", "|---|---|---|"]
    for src, col in COLUMNS.items():
        empty = int(df[col].isna().sum())
        if empty:
            lines.append(f"| {src} | {empty} | {n} |")
    lines.append("")

    # Strengths that Excel turned into numbers (e.g. 0.1% became 0.001)
    numeric = raw[raw["Strength"].map(lambda v: isinstance(v, (int, float)) and not pd.isna(v))]
    lines += ["## Strengths stored as numbers", "",
              "Excel converted these to numbers, probably from percentages (0.1% → 0.001). "
              "Set the Strength column to Text and re-enter them.", ""]
    for _, r in numeric.iterrows():
        lines.append(f"- {r['Trade Name (EN)']} · {r['Dosage Form']}: `{r['Strength']}`")
    lines.append("")

    # Inconsistent spellings
    lines += ["## Inconsistent spellings (fixed automatically on import)", ""]
    for src in ["Dosage Form", "Route"]:
        counts = Counter(raw[src].dropna().astype(str).str.strip())
        lower = Counter()
        for k, v in counts.items():
            lower[k.lower()] += 1
        dupes = [k for k, c in lower.items() if c > 1]
        if dupes:
            lines.append(f"- {src}: " + ", ".join(sorted(k for k in counts if k.lower() in dupes)))
    lines += ["- Currency: `JD` is stored as `JOD`", ""]

    # Rows without price
    no_price = df[df["price"].isna()]
    lines += [f"## Rows without a price ({len(no_price)})", ""]
    for _, r in no_price.iterrows():
        lines.append(f"- {r['trade_name_en']} {r['strength']} {r['dosage_form']}, {r['pack_size']}")
    lines.append("")

    # Packs we could not parse into a count
    unparsed = df[df["pack_size"].map(lambda t: parse_pack(t)[0] is None)]
    if len(unparsed):
        lines += ["## Pack sizes without a number", ""]
        lines += [f"- {r['trade_name_en']}: `{r['pack_size']}`" for _, r in unparsed.iterrows()]
        lines.append("")

    # Ingredient spelling variants (same name, different case)
    names = Counter()
    for v in df["ingredients"].dropna():
        for p in split_ingredients(v):
            names[p] += 1
    groups = {}
    for name in names:
        groups.setdefault(name.lower(), []).append(name)
    variants = [sorted(v) for v in groups.values() if len(v) > 1]
    if variants:
        lines += ["## Ingredient names written in different ways", ""]
        lines += ["- " + " / ".join(v) for v in variants]
        lines.append("")

    lines += ["## Fields the website needs that are not in the data yet", "",
              "| Field | Used for |", "|---|---|"]
    lines += [f"| {f} | {u} |" for f, u in MISSING_FIELDS]
    return "\n".join(lines) + "\n"


def load_db(df, dsn):
    import psycopg

    with psycopg.connect(dsn) as conn, conn.cursor() as cur:
        ingredient_ids, manufacturer_ids = {}, {}

        def ingredient(name):
            key = name.lower()
            if key not in ingredient_ids:
                cur.execute(
                    "INSERT INTO ingredients (name_en) VALUES (%s) "
                    "ON CONFLICT (name_en) DO UPDATE SET name_en = EXCLUDED.name_en RETURNING id",
                    (name,),
                )
                ingredient_ids[key] = cur.fetchone()[0]
            return ingredient_ids[key]

        def manufacturer(name, country):
            if name is None:
                return None
            if name not in manufacturer_ids:
                cur.execute(
                    "INSERT INTO manufacturers (name, country) VALUES (%s, %s) "
                    "ON CONFLICT (name) DO UPDATE SET country = COALESCE(manufacturers.country, EXCLUDED.country) "
                    "RETURNING id",
                    (name, country),
                )
                manufacturer_ids[name] = cur.fetchone()[0]
            return manufacturer_ids[name]

        # pandas keeps empty cells as NaN; the database needs NULL
        rows = [{k: (None if pd.isna(v) else v) for k, v in rec.items()} for rec in df.to_dict("records")]
        for r in rows:
            m_id = manufacturer(r["manufacturer"], r["country"])
            cur.execute(
                """INSERT INTO products (trade_name_en, trade_name_ar, strength_text, dosage_form, route,
                       rx_status, atc_code, therapeutic_class, registration_no, manufacturer_id, notes)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (trade_name_en, strength_text, dosage_form, manufacturer_id)
                   DO UPDATE SET updated_at = now()
                   RETURNING id""",
                (r["trade_name_en"], r["trade_name_ar"], r["strength"], r["dosage_form"], r["route"],
                 r["rx_status"], r["atc_code"], r["therapeutic_class"], r["registration_no"], m_id, r["notes"]),
            )
            p_id = cur.fetchone()[0]
            for pos, name in enumerate(split_ingredients(r["ingredients"])):
                cur.execute(
                    "INSERT INTO product_ingredients VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                    (p_id, ingredient(name), pos),
                )
            count, unit = parse_pack(r["pack_size"])
            price = None if r["price"] is None else float(r["price"])
            cur.execute(
                """INSERT INTO packs (product_id, pack_size_text, unit_count, unit_name, public_price, currency)
                   VALUES (%s, %s, %s, %s, %s, %s)
                   ON CONFLICT (product_id, pack_size_text) DO UPDATE SET public_price = EXCLUDED.public_price""",
                (p_id, r["pack_size"], count, unit, price, r["currency"] or "JOD"),
            )
        conn.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("xlsx")
    parser.add_argument("--db", help="PostgreSQL connection string; omit for report only")
    parser.add_argument("--report", default=str(Path(__file__).resolve().parents[2] / "docs" / "data_report.md"))
    args = parser.parse_args()

    raw = pd.read_excel(args.xlsx)
    df = load_sheet(args.xlsx)
    Path(args.report).write_text(build_report(df, raw), encoding="utf-8")
    print(f"Report written to {args.report}")
    if args.db:
        load_db(df, args.db)
        print("Data loaded.")


if __name__ == "__main__":
    main()
