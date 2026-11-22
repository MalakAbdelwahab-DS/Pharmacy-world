"""Pharmacy World API."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import account, assistant, browse, medicines

# Websites allowed to call the API: local development and the GitHub Pages site
CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS", "http://localhost:3000,https://malakabdelwahab-ds.github.io"
).split(",")

app = FastAPI(title="Pharmacy World API")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_methods=["GET", "POST", "PUT", "DELETE"], allow_headers=["*"])
app.include_router(medicines.router)
app.include_router(browse.router)
app.include_router(account.router)
app.include_router(assistant.router)


@app.get("/health")
def health():
    return {"status": "ok"}
