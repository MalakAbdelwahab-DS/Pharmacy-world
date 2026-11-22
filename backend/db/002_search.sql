-- Fuzzy search (handles typos such as "Panadool")
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_products_trade_name_trgm ON products USING gin (lower(trade_name_en) gin_trgm_ops);
CREATE INDEX idx_ingredients_name_trgm ON ingredients USING gin (lower(name_en) gin_trgm_ops);

-- Ingredient "signature" of each product: its ingredients, sorted, joined with '+'.
-- Two products are the same medicine when signature, strength and form match.
CREATE VIEW product_signatures AS
SELECT p.id AS product_id,
       string_agg(lower(i.name_en), '+' ORDER BY lower(i.name_en)) AS signature,
       string_agg(i.name_en, ' + ' ORDER BY pi.position) AS ingredients
FROM products p
JOIN product_ingredients pi ON pi.product_id = p.id
JOIN ingredients i ON i.id = pi.ingredient_id
GROUP BY p.id;

-- One row per product with everything a medicine card needs.
CREATE VIEW medicine_cards AS
SELECT p.id,
       p.trade_name_en,
       p.trade_name_ar,
       s.ingredients,
       s.signature,
       p.strength_text,
       p.dosage_form,
       p.route,
       p.rx_status,
       p.status,
       p.priority,
       p.priority IS NOT NULL AS sponsored,
       p.therapeutic_class,
       p.atc_code,
       m.name AS manufacturer,
       m.country,
       min(k.public_price) AS from_price,
       min(k.public_price / NULLIF(k.unit_count, 0)) AS price_per_unit,
       (array_agg(k.unit_name ORDER BY k.public_price / NULLIF(k.unit_count, 0)) FILTER (WHERE k.public_price IS NOT NULL))[1] AS unit_name
FROM products p
JOIN product_signatures s ON s.product_id = p.id
LEFT JOIN manufacturers m ON m.id = p.manufacturer_id
LEFT JOIN packs k ON k.product_id = p.id
GROUP BY p.id, s.ingredients, s.signature, m.name, m.country;
