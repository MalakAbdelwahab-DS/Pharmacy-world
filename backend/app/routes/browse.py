from fastapi import APIRouter, HTTPException, Query

from app.conditions import BY_SLUG, CONDITIONS
from app.db import query
from app.ordering import with_sponsored_first

router = APIRouter(tags=["browse"])


@router.get("/categories")
def categories():
    """Therapeutic classes for now; replaced by the public categories once Dr. Sakher groups them."""
    return query(
        """SELECT therapeutic_class AS name, count(*) AS medicines,
                  (array_agg(DISTINCT ingredients))[1:3] AS examples
           FROM medicine_cards WHERE therapeutic_class IS NOT NULL
           GROUP BY therapeutic_class ORDER BY therapeutic_class"""
    )


@router.get("/categories/{name}")
def category(name: str):
    rows = query(
        """SELECT id, trade_name_en, trade_name_ar, ingredients, strength_text, dosage_form, rx_status, status, sponsored, priority,
                  manufacturer, country, from_price, price_per_unit, unit_name
           FROM medicine_cards WHERE therapeutic_class = %s ORDER BY trade_name_en, strength_text""",
        (name,),
    )
    return {"name": name, "total": len(rows), "results": with_sponsored_first(rows)}


@router.get("/ingredients")
def ingredients(letter: str | None = Query(None, min_length=1, max_length=1)):
    rows = query(
        """SELECT i.id, i.name_en, i.name_ar, count(DISTINCT pi.product_id) AS medicines
           FROM ingredients i JOIN product_ingredients pi ON pi.ingredient_id = i.id
           GROUP BY i.id ORDER BY lower(i.name_en)"""
    )
    return _by_letter(rows, "name_en", letter)


@router.get("/brands")
def brands(letter: str | None = Query(None, min_length=1, max_length=1), country: str | None = None):
    """Brands A-Z. The country filter uses the manufacturer's country of origin."""
    rows = query(
        """SELECT trade_name_en AS name, min(trade_name_ar) AS name_ar,
                  array_agg(DISTINCT country) FILTER (WHERE country IS NOT NULL) AS countries,
                  count(*) AS medicines
           FROM medicine_cards
           WHERE %(country)s::text IS NULL OR country = %(country)s
           GROUP BY trade_name_en ORDER BY lower(trade_name_en)""",
        {"country": country},
    )
    return _by_letter(rows, "name", letter)


@router.get("/brands/countries")
def brand_countries():
    return query(
        """SELECT country, count(DISTINCT trade_name_en) AS brands FROM medicine_cards
           WHERE country IS NOT NULL GROUP BY country ORDER BY country"""
    )


def _by_letter(rows, field, letter):
    letters = sorted({r[field][0].upper() for r in rows if r[field]})
    if letter:
        rows = [r for r in rows if r[field] and r[field][0].upper() == letter.upper()]
    return {"letters": letters, "total": len(rows), "items": rows}


def _condition_filter(classes):
    return " OR ".join(["therapeutic_class ILIKE %s"] * len(classes)), [f"%{c}%" for c in classes]


@router.get("/conditions")
def conditions():
    out = []
    for c in CONDITIONS:
        where, params = _condition_filter(c["classes"])
        row = query(
            f"""SELECT count(*) AS medicines, (array_agg(DISTINCT ingredients))[1:3] AS examples
                FROM medicine_cards WHERE {where}""",
            params,
        )[0]
        if row["medicines"]:
            out.append({"slug": c["slug"], "name_en": c["name_en"], "name_ar": c["name_ar"], **row})
    return out


@router.get("/conditions/{slug}")
def condition(slug: str):
    c = BY_SLUG.get(slug)
    if not c:
        raise HTTPException(404, "Condition not found")
    where, params = _condition_filter(c["classes"])
    rows = query(
        f"""SELECT id, trade_name_en, trade_name_ar, ingredients, strength_text, dosage_form, rx_status, status, sponsored,
                   priority, manufacturer, country, from_price, price_per_unit, unit_name
            FROM medicine_cards WHERE {where} ORDER BY trade_name_en, strength_text""",
        params,
    )
    return {"slug": slug, "name_en": c["name_en"], "name_ar": c["name_ar"], "total": len(rows),
            "results": with_sponsored_first(rows)}
