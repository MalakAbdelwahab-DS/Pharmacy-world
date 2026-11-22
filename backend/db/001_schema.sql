-- Pharmacy World: core medicine data
-- One "product" = one trade name + strength + dosage form + manufacturer.
-- One "pack" = one pack size of a product, with its public price.

CREATE TABLE manufacturers (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    country     TEXT                        -- country of origin (used by the Brands A-Z country filter)
);

CREATE TABLE ingredients (
    id          SERIAL PRIMARY KEY,
    name_en     TEXT NOT NULL UNIQUE,
    name_ar     TEXT
);

CREATE TABLE products (
    id                  SERIAL PRIMARY KEY,
    trade_name_en       TEXT NOT NULL,
    trade_name_ar       TEXT,
    strength_text       TEXT NOT NULL,      -- as shown on the pack, e.g. "500 mg", "1 mg / 1 ml"
    dosage_form         TEXT NOT NULL,      -- normalised, e.g. "Tablet", "Film-coated tablet"
    route               TEXT,
    rx_status           TEXT CHECK (rx_status IN ('Rx', 'OTC')),
    atc_code            TEXT,
    therapeutic_class   TEXT,
    registration_no     TEXT,
    manufacturer_id     INT REFERENCES manufacturers(id),
    status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discontinued')),
    priority            INT,                -- paid placement; NULL = not sponsored. Never used to sort exact alternatives.
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE NULLS NOT DISTINCT (trade_name_en, strength_text, dosage_form, manufacturer_id)
);

-- Ingredients of each product, in order. "Same medicine" = same set of ingredients, strengths and form.
CREATE TABLE product_ingredients (
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id   INT NOT NULL REFERENCES ingredients(id),
    position        INT NOT NULL,
    PRIMARY KEY (product_id, ingredient_id)
);

CREATE TABLE packs (
    id                  SERIAL PRIMARY KEY,
    product_id          INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    pack_size_text      TEXT NOT NULL,      -- as in the data, e.g. "30 tablet", "5 amp * 2 ml"
    unit_count          NUMERIC,            -- parsed count for price per unit, e.g. 30
    unit_name           TEXT,               -- e.g. "tablet", "ml"
    public_price        NUMERIC(10, 3),
    currency            TEXT DEFAULT 'JOD',
    price_includes_vat  BOOLEAN,            -- unknown until Dr. Sakher confirms
    UNIQUE (product_id, pack_size_text)
);

-- Clinical information per product, one row per section, each with its reference and date.
CREATE TABLE clinical_sections (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    section         TEXT NOT NULL,          -- e.g. 'uses', 'dosage', 'side_effects', 'warnings'
    content_en      TEXT,
    content_ar      TEXT,
    reference       TEXT NOT NULL,
    last_updated    DATE NOT NULL,
    UNIQUE (product_id, section)
);

CREATE INDEX idx_products_trade_name ON products (lower(trade_name_en));
CREATE INDEX idx_products_class ON products (therapeutic_class);
CREATE INDEX idx_ingredients_name ON ingredients (lower(name_en));
