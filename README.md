# Pharmacy World

Bilingual (Arabic / English) medicine information website for Pharmacy World, Jordan.

## Structure

| Folder | What's in it |
|---|---|
| `backend/` | FastAPI API, database schema, import script |
| `frontend/` | Next.js website (static export, English and Arabic) |
| `backend/db/` | Database migrations (numbered SQL files) |
| `.github/workflows/` | CI/CD pipeline |
| `data/sample/` | Sample medicine spreadsheet |
| `docs/` | Data report: what the data is missing |

## Run it locally

You need Docker Desktop, Python 3.11+ and Poetry (`pipx install poetry`).

```bash
# 1. Start the database
docker compose up -d

# 2. Install the backend packages (the virtual environment goes in backend/.venv)
cd backend
poetry config virtualenvs.in-project true
poetry install

# 3. Create or update the tables
DATABASE_URL=postgresql://pharmacy:pharmacy@localhost:5432/pharmacy poetry run python scripts/migrate.py

# 4. Import the sample data and write docs/data_report.md
poetry run python scripts/import_sample.py ../data/sample/pharmacy_world_drug_data.xlsx \
  --db postgresql://pharmacy:pharmacy@localhost:5432/pharmacy

# 5. Run the tests
poetry run pytest

# 6. Start the API, then open http://localhost:8000/docs
poetry run uvicorn app.main:app --reload
```

Frontend, in a second terminal:

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000/en
```

To change the database, add a new numbered file in `backend/db/` (for example `003_users.sql`). Never edit a file that was already applied.

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

## Deployment (environment: development)

| Part | Where | URL |
|---|---|---|
| Website | GitHub Pages | https://malakabdelwahab-ds.github.io/pharmacy-world/ |
| API | Render (free) | set in the `API_URL` variable |
| Database | Neon (free) | private |

`.github/workflows/ci-cd.yml` runs on every pull request (tests and build) and on every push to `main`
(tests, build, then deploy). Deploy order: database migrations → backend on Render → website on GitHub Pages.
The Render free plan sleeps after 15 minutes without visitors; the first request after that takes 30–50 seconds.

### One-time setup

1. **Repo public** (needed for GitHub Pages on a free account): Settings → General → Danger zone → Change visibility.
2. **Pages**: Settings → Pages → Source: **GitHub Actions**.
3. **Neon**: create a project (region Frankfurt), copy the connection string.
4. **Render**: New → Blueprint → pick this repo (it reads `render.yaml`). Paste the Neon connection string as `DATABASE_URL`.
   Then in the service: Settings → Deploy hook → copy the URL. Note the service URL (`https://….onrender.com`).
5. **GitHub environment**: Settings → Environments → New environment `development`, then add:
   - Secret `DATABASE_URL`: the Neon connection string
   - Secret `RENDER_DEPLOY_HOOK`: the Render deploy hook URL
   - Variable `API_URL`: the Render service URL, without a trailing slash
6. Actions → CI/CD → Run workflow.
