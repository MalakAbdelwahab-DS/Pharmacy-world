"""AI assistant: answers only from Pharmacy World's own data, with sources.

Three kinds of reply:
- safety:  emergency words were detected. The site shows fixed text and a "Call 911" button.
           This text is never written by the AI.
- no_info: the data does not contain the answer (or the AI is not connected yet).
- answer:  an answer written by Claude from the medicine data, with source cards.
"""

import base64
import json
import os
import re

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.auth import optional_user
from app.db import query, query_one
from app.routes.medicines import alternatives, detail

router = APIRouter(tags=["assistant"])

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-5-5")
NO_INFO = "NO_VERIFIED_INFO"

SAFETY = re.compile(
    r"overdos|took \d+|taken \d+|swallow|poison|can'?t breathe|cannot breathe|chest pain|unconscious|faint|seizure|"
    r"allergic reaction|swell|suicid|kill myself|end my life|bleeding|"
    r"جرعة زائدة|ابتلع|بلع|تسمم|لا أستطيع التنفس|ضيق تنفس|ألم في الصدر|فقد الوعي|إغماء|انتحار|تحسس شديد|تورم|نزيف",
    re.IGNORECASE,
)

SYSTEM = """You are the AI assistant on Pharmacy World, a medicine information website in Jordan.
Answer ONLY from the DATA given to you. Never use outside knowledge.
If the DATA does not contain what is needed to answer, reply with exactly: NO_VERIFIED_INFO
Rules:
- Reply in the same language as the question (Arabic or English). Plain, short, friendly sentences.
- Never give a personal dose. Only repeat dosing that is written in the DATA, and remind the person to follow their doctor or pharmacist.
- Never say that a combination is "safe" just because no interaction is listed.
- Prices are public prices in JOD.
- End your reply with one last line: SOURCES: followed by the ids of the medicines you used, comma separated."""


class Ask(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    medicine_id: int | None = None
    chat_id: int | None = None


def _client():
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return None
    import anthropic

    return anthropic.Anthropic(api_key=key)


def _medicine_facts(medicine_id: int) -> dict | None:
    try:
        med = detail(medicine_id)
    except HTTPException:
        return None
    alts = alternatives(medicine_id)
    return {
        "id": med["id"],
        "name": f"{med['trade_name_en']} {med['strength_text']}",
        "ingredients": med["ingredients"],
        "form": med["dosage_form"],
        "route": med["route"],
        "rx_or_otc": med["rx_status"],
        "status": med["status"],
        "manufacturer": med["manufacturer"],
        "country": med["country"],
        "therapeutic_class": med["therapeutic_class"],
        "packs": [
            {"pack": p["pack_size_text"], "public_price_jod": p["public_price"], "price_per_unit_jod": p["price_per_unit"]}
            for p in med["packs"]
        ],
        "clinical_sections": [
            {"section": s["section"], "text": s["content_en"], "text_ar": s["content_ar"], "reference": s["reference"],
             "last_updated": str(s["last_updated"])}
            for s in med["clinical_sections"]
        ],
        "same_medicine_other_manufacturers": [
            {"id": a["id"], "name": f"{a['trade_name_en']} {a['strength_text']}", "manufacturer": a["manufacturer"],
             "from_price_jod": a["from_price"], "price_per_unit_jod": a["price_per_unit"]}
            for a in alts["same_medicine"]
        ],
    }


def _mentioned_medicines(question: str, exclude: int | None) -> list[int]:
    words = {w.lower() for w in re.findall(r"[A-Za-z][A-Za-z\-]{2,}", question)}
    if not words:
        return []
    rows = query(
        """SELECT DISTINCT ON (lower(trade_name_en)) id FROM products
           WHERE lower(trade_name_en) = ANY(%s) AND id <> COALESCE(%s, -1) LIMIT 3""",
        (list(words), exclude),
    )
    return [r["id"] for r in rows]


def _source(facts: dict) -> dict:
    refs = [s for s in facts["clinical_sections"] if s["reference"]]
    return {
        "medicine_id": facts["id"],
        "name": facts["name"],
        "reference": refs[0]["reference"] if refs else "Pharmacy World medicine data",
        "last_updated": refs[0]["last_updated"] if refs else None,
    }


def _answer(question: str, medicine_id: int | None) -> tuple[str, str, list]:
    if SAFETY.search(question):
        return "safety", "", []

    ids = ([medicine_id] if medicine_id else []) + _mentioned_medicines(question, medicine_id)
    facts = [f for f in (_medicine_facts(i) for i in ids) if f]
    client = _client()
    if not facts or client is None:
        return "no_info", "", []

    response = client.messages.create(
        model=MODEL,
        max_tokens=600,
        system=SYSTEM,
        messages=[{"role": "user", "content": f"DATA:\n{json.dumps(facts, default=str, ensure_ascii=False)}\n\nQUESTION:\n{question}"}],
    )
    text = "".join(b.text for b in response.content if b.type == "text").strip()
    if not text or NO_INFO in text:
        return "no_info", "", []

    used = set()
    match = re.search(r"\n?SOURCES:\s*(.*)$", text, re.IGNORECASE)
    if match:
        used = {int(x) for x in re.findall(r"\d+", match.group(1))}
        text = text[: match.start()].strip()
    sources = [_source(f) for f in facts if f["id"] in used] or [_source(facts[0])]
    return "answer", text, sources


@router.post("/assistant/ask")
def ask(body: Ask, user=Depends(optional_user)):
    user_id = user["id"] if user else None
    if body.chat_id:
        chat = query_one("SELECT id, user_id FROM chats WHERE id = %s", (body.chat_id,))
        if not chat or (chat["user_id"] is not None and chat["user_id"] != user_id):
            raise HTTPException(404, "Chat not found")
        chat_id = chat["id"]
    else:
        chat_id = query_one(
            "INSERT INTO chats (user_id, product_id, title) VALUES (%s, %s, %s) RETURNING id",
            (user_id, body.medicine_id, body.question.strip()[:120]),
        )["id"]

    kind, text, sources = _answer(body.question.strip(), body.medicine_id)
    query(
        "INSERT INTO chat_messages (chat_id, role, kind, content) VALUES (%s, 'user', 'question', %s) RETURNING id",
        (chat_id, body.question.strip()),
    )
    query(
        "INSERT INTO chat_messages (chat_id, role, kind, content, sources) VALUES (%s, 'assistant', %s, %s, %s) RETURNING id",
        (chat_id, kind, text, json.dumps(sources, default=str)),
    )
    return {"chat_id": chat_id, "kind": kind, "text": text, "sources": sources}


@router.post("/search/photo")
async def search_by_photo(image: UploadFile = File(...)):
    """Read medicine names from a photo of a pack or prescription. The photo is not stored."""
    client = _client()
    if client is None:
        raise HTTPException(503, "not_configured")
    data = await image.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(413, "too_large")
    media_type = image.content_type if image.content_type in ("image/jpeg", "image/png", "image/webp", "image/gif") else "image/jpeg"
    response = client.messages.create(
        model=MODEL,
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": base64.b64encode(data).decode()}},
                {"type": "text", "text": "List the medicine trade names (with strength if visible) written in this image, "
                                         "as a JSON array of strings. Only names you can read clearly. If none, return []."},
            ],
        }],
    )
    text = "".join(b.text for b in response.content if b.type == "text")
    match = re.search(r"\[.*\]", text, re.DOTALL)
    try:
        found = [str(x) for x in json.loads(match.group(0))][:5] if match else []
    except json.JSONDecodeError:
        found = []
    return {"found": found}
