# Pharmacy World

Bilingual (Arabic / English) medicine information website for Pharmacy World, Jordan.

## Structure

| Folder | What's in it |
|---|---|
| `backend/` | FastAPI API, database schema, import script |
| `frontend/` | Next.js website (not created yet) |
| `data/sample/` | Sample medicine spreadsheet |
| `docs/` | Data report: what the data is missing |

## Run it locally

You need Docker Desktop, Python 3.11+ and Poetry (`pipx install poetry`).

```bash
# 1. Start the database (creates the tables on first start)
docker compose up -d

# 2. Install the backend packages (the virtual environment goes in backend/.venv)
cd backend
poetry config virtualenvs.in-project true
poetry install

# 3. Import the sample data and write docs/data_report.md
poetry run python scripts/import_sample.py ../data/sample/pharmacy_world_drug_data.xlsx \
  --db postgresql://pharmacy:pharmacy@localhost:5432/pharmacy

# 4. Run the tests
poetry run pytest

# 5. Start the API, then open http://localhost:8000/docs
poetry run uvicorn app.main:app --reload
```

If you changed the SQL files after the first start, reset the database with `docker compose down -v` and start again.

## API

| Endpoint | What it returns |
|---|---|
| `GET /medicines/search?q=` | Results by trade name or ingredient, typo-tolerant, sponsored first (max 2), plus `did_you_mean` when nothing matches |
| `GET /medicines/{id}` | Medicine with packs (public price, price per unit, VAT flag) and clinical sections |
| `GET /medicines/{id}/alternatives` | `same_medicine` sorted by price per unit (with `lower_price`), and `similar` medicines |
| `GET /categories`, `GET /categories/{name}` | Categories (therapeutic classes for now) and their medicines |
| `GET /ingredients?letter=` | Ingredients A–Z |
| `GET /brands?letter=&country=`, `GET /brands/countries` | Brands A–Z with the country filter |

## Data rules

- A **product** is one trade name + strength + form + manufacturer. A **pack** is one pack size with its public price.
- Running the import again updates rows instead of duplicating them.
- `priority` is for paid placement: a higher number ranks higher, at most 2 sponsored items go on top and each is labelled. The rules live in `backend/app/ordering.py`.
- "Same medicine" alternatives are always sorted by price, never by priority.
