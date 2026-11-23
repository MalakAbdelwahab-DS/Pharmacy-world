from fastapi import APIRouter, HTTPException, Query

from app.db import query
from app.ordering import with_sponsored_first
from app.taxonomy import CATEGORIES, CATEGORY_BY_SLUG, CONDITION_BY_SLUG, CONDITIONS, classes_lower, matches, public

router = APIRouter(tags=["browse"])

LIST_FIELDS = """id, trade_name_en, trade_name_ar, ingredients, strength_text, dosage_form, rx_status, status, sponsored,
                 priority, manufacturer, country, from_price, price_per_unit, unit_name, therapeutic_class"""


def _medicines(classes):
    return query(
        f"SELECT {LIST_FIELDS} FROM medicine_cards WHERE lower(therapeutic_class) = ANY(%s) ORDER BY trade_name_en, strength_text",
        (classes,),
    )


def _summary(item):
    """Count and up to 3 example ingredients for a category or condition tile."""
    row = query(
        """SELECT count(*) AS medicines,
                  (SELECT array_agg(i) FROM (SELECT DISTINCT ingredients AS i FROM medicine_cards
                    WHERE lower(therapeutic_class) = ANY(%(c)s) ORDER BY 1 LIMIT 3) x) AS examples
           FROM medicine_cards WHERE lower(therapeutic_class) = ANY(%(c)s)""",
        {"c": classes_lower(item)},
    )[0]
    return {"medicines": row["medicines"], "examples": row["examples"] or []}


@router.get("/categories")
def categories():
    return [public(c, _summary(c)) for c in CATEGORIES]


@router.get("/categories/{slug}")
def category(slug: str):
    c = CATEGORY_BY_SLUG.get(slug)
    if not c:
        raise HTTPException(404, "Category not found")
    rows = _medicines(classes_lower(c))
    # Conditions inside this category, for the filter chips under the title
    chips = []
    for cond in CONDITIONS:
        ids = [r["id"] for r in rows if matches(cond, r["therapeutic_class"])]
        if ids:
            chips.append({"slug": cond["slug"], "name_en": cond["name_en"], "name_ar": cond["name_ar"], "ids": ids})
    return public(c, {"total": len(rows), "results": with_sponsored_first(rows), "conditions": chips})


@router.get("/conditions")
def conditions():
    return [public(c, _summary(c)) for c in CONDITIONS]


@router.get("/conditions/{slug}")
def condition(slug: str):
    c = CONDITION_BY_SLUG.get(slug)
    if not c:
        raise HTTPException(404, "Condition not found")
    rows = _medicines(classes_lower(c))
    return public(c, {"total": len(rows), "results": with_sponsored_first(rows), "conditions": []})


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
