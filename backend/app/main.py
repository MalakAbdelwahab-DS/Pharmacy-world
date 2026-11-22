"""Pharmacy World API."""

from fastapi import FastAPI

from app.routes import browse, medicines

app = FastAPI(title="Pharmacy World API")
app.include_router(medicines.router)
app.include_router(browse.router)


@app.get("/health")
def health():
    return {"status": "ok"}
