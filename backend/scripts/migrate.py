"""Apply the SQL files in backend/db in order, once each.

Applied files are recorded in the schema_migrations table, so running this again only applies new files.
Never edit a file that has already been applied: add a new numbered file instead.

Usage: python scripts/migrate.py            (uses DATABASE_URL)
"""

import os
import sys
from pathlib import Path

import psycopg

DB_DIR = Path(__file__).resolve().parents[1] / "db"


def main():
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        sys.exit("DATABASE_URL is not set")
    with psycopg.connect(dsn) as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())")
        applied = {r[0] for r in conn.execute("SELECT name FROM schema_migrations")}
        for path in sorted(DB_DIR.glob("*.sql")):
            if path.name in applied:
                continue
            print(f"Applying {path.name}")
            with conn.transaction():
                conn.execute(path.read_text())
                conn.execute("INSERT INTO schema_migrations (name) VALUES (%s)", (path.name,))
    print("Database is up to date.")


if __name__ == "__main__":
    main()
