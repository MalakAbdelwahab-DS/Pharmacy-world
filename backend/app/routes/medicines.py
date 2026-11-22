from fastapi import APIRouter, HTTPException, Query

from app.db import query, query_one
from app.ordering import with_sponsored_first

router = APIRouter(prefix="/medicines", tags=["medicines"])

CARD_FIELDS = """id, trade_name_en, trade_name_ar, ingredients, strength_text, dosage_form, rx_status, status,
                 sponsored, priority, manufacturer, country, from_price, price_per_unit, unit_name"""


@router.get("/search")
def search(q: str = Query(min_length=2, max_length=100), limit: int = Query(20, le=50)):
    """Search by trade name or active ingredient, tolerant of small typos."""
    term = q.strip().lower()
    rows = query(
        f"""
        SELECT {CARD_FIELDS},
               GREATEST(similarity(lower(trade_name_en), %(t)s), similarity(lower(ingredients), %(t)s)) AS score,
               lower(trade_name_en) = %(t)s AS exact_name,
               lower(trade_name_en) LIKE %(prefix)s AS prefix_name
        FROM medicine_cards
        WHERE lower(trade_name_en) LIKE %(like)s
           OR lower(ingredients) LIKE %(like)s
           OR similarity(lower(trade_name_en), %(t)s) > 0.4
        ORDER BY exact_name DESC, prefix_name DESC, score DESC, trade_name_en, strength_text
        LIMIT %(limit)s
        """,
        {"t": term, "like": f"%{term}%", "prefix": f"{term}%", "limit": limit},
    )
    results = with_sponsored_first([_clean(r) for r in rows])

    did_you_mean = None
    if not results:
        guess = query_one(
            """SELECT trade_name_en FROM products
               WHERE similarity(lower(trade_name_en), %s) > 0.2
               ORDER BY similarity(lower(trade_name_en), %s) DESC LIMIT 1""",
            (term, term),
        )
        did_you_mean = guess["trade_name_en"] if guess else None

    return {"query": q, "total": len(results), "results": results, "did_you_mean": did_you_mean}


@router.get("/{medicine_id}")
def detail(medicine_id: int):
    card = query_one(f"SELECT {CARD_FIELDS}, route, therapeutic_class, atc_code FROM medicine_cards WHERE id = %s",
                     (medicine_id,))
    if not card:
        raise HTTPException(404, "Medicine not found")
    card["packs"] = query(
        """SELECT pack_size_text, unit_count, unit_name, public_price, currency, price_includes_vat,
                  round(public_price / NULLIF(unit_count, 0), 3) AS price_per_unit
           FROM packs WHERE product_id = %s ORDER BY unit_count NULLS LAST""",
        (medicine_id,),
    )
    card["clinical_sections"] = query(
        """SELECT section, content_en, content_ar, reference, last_updated
           FROM clinical_sections WHERE product_id = %s ORDER BY id""",
        (medicine_id,),
    )
    return card


@router.get("/{medicine_id}/alternatives")
def alternatives(medicine_id: int):
    """Same medicine: same ingredients, strength and form, sorted by price (never by priority).
    Similar medicines: same therapeutic class but a different ingredient or strength."""
    current = query_one("SELECT * FROM medicine_cards WHERE id = %s", (medicine_id,))
    if not current:
        raise HTTPException(404, "Medicine not found")

    same = query(
        f"""SELECT {CARD_FIELDS} FROM medicine_cards
            WHERE id <> %s AND signature = %s AND lower(strength_text) = lower(%s) AND dosage_form = %s
            ORDER BY price_per_unit NULLS LAST, priority DESC NULLS LAST, trade_name_en""",
        (medicine_id, current["signature"], current["strength_text"], current["dosage_form"]),
    )
    for item in same:
        item["lower_price"] = (
            item["price_per_unit"] is not None
            and current["price_per_unit"] is not None
            and item["price_per_unit"] < current["price_per_unit"]
        )

    similar = []
    if current["therapeutic_class"]:
        similar = query(
            f"""SELECT {CARD_FIELDS} FROM medicine_cards
                WHERE id <> %s AND therapeutic_class = %s
                  AND NOT (signature = %s AND lower(strength_text) = lower(%s) AND dosage_form = %s)
                ORDER BY trade_name_en, strength_text LIMIT 12""",
            (medicine_id, current["therapeutic_class"], current["signature"],
             current["strength_text"], current["dosage_form"]),
        )
        similar = with_sponsored_first(similar)[:6]

    return {"same_medicine": [_clean(r) for r in same], "similar": [_clean(r) for r in similar]}


def _clean(row):
    for key in ("score", "exact_name", "prefix_name"):
        row.pop(key, None)
    return row
