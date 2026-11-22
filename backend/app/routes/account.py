import re

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from app.auth import _token, check_password, create_session, current_user, end_session, hash_password
from app.db import query, query_one

router = APIRouter(tags=["account"])

EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class Register(BaseModel):
    name: str
    email: str
    password: str


class Login(BaseModel):
    email: str
    password: str


@router.post("/auth/register")
def register(body: Register):
    email = body.email.strip().lower()
    errors = {}
    if not body.name.strip():
        errors["name"] = "required"
    if not EMAIL.match(email):
        errors["email"] = "invalid"
    if len(body.password) < 8:
        errors["password"] = "too_short"
    if errors:
        raise HTTPException(422, {"fields": errors})
    if query_one("SELECT 1 FROM users WHERE email = %s", (email,)):
        raise HTTPException(409, {"fields": {"email": "taken"}})
    user = query_one(
        "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id, name, email",
        (body.name.strip(), email, hash_password(body.password)),
    )
    return {"token": create_session(user["id"]), "user": user}


@router.post("/auth/login")
def login(body: Login):
    user = query_one("SELECT id, name, email, password_hash FROM users WHERE email = %s", (body.email.strip().lower(),))
    if not user or not check_password(body.password, user.pop("password_hash")):
        raise HTTPException(401, {"fields": {"password": "wrong"}})
    return {"token": create_session(user["id"]), "user": user}


@router.post("/auth/logout")
def logout(authorization: str | None = Header(None)):
    token = _token(authorization)
    if token:
        end_session(token)
    return {"ok": True}


@router.get("/auth/me")
def me(user=Depends(current_user)):
    return user


@router.get("/me/saved")
def saved(user=Depends(current_user)):
    return query(
        """SELECT c.id, c.trade_name_en, c.trade_name_ar, c.ingredients, c.strength_text, c.dosage_form, c.rx_status,
                  c.status, c.sponsored, c.priority, c.manufacturer, c.country, c.from_price, c.price_per_unit, c.unit_name
           FROM saved_medicines s JOIN medicine_cards c ON c.id = s.product_id
           WHERE s.user_id = %s ORDER BY s.created_at DESC""",
        (user["id"],),
    )


@router.put("/me/saved/{medicine_id}")
def save(medicine_id: int, user=Depends(current_user)):
    if not query_one("SELECT 1 FROM products WHERE id = %s", (medicine_id,)):
        raise HTTPException(404, "Medicine not found")
    query(
        "INSERT INTO saved_medicines (user_id, product_id) VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING user_id",
        (user["id"], medicine_id),
    )
    return {"saved": True}


@router.delete("/me/saved/{medicine_id}")
def unsave(medicine_id: int, user=Depends(current_user)):
    query("DELETE FROM saved_medicines WHERE user_id = %s AND product_id = %s RETURNING user_id", (user["id"], medicine_id))
    return {"saved": False}


@router.get("/me/chats")
def chats(user=Depends(current_user)):
    return query(
        """SELECT ch.id, ch.title, ch.created_at, ch.product_id,
                  p.trade_name_en AS medicine, p.strength_text AS strength
           FROM chats ch LEFT JOIN products p ON p.id = ch.product_id
           WHERE ch.user_id = %s ORDER BY ch.created_at DESC""",
        (user["id"],),
    )


@router.get("/me/chats/{chat_id}")
def chat(chat_id: int, user=Depends(current_user)):
    head = query_one(
        """SELECT ch.id, ch.title, ch.product_id, p.trade_name_en AS medicine, p.strength_text AS strength
           FROM chats ch LEFT JOIN products p ON p.id = ch.product_id WHERE ch.id = %s AND ch.user_id = %s""",
        (chat_id, user["id"]),
    )
    if not head:
        raise HTTPException(404, "Chat not found")
    head["messages"] = query(
        "SELECT role, kind, content, sources FROM chat_messages WHERE chat_id = %s ORDER BY id", (chat_id,)
    )
    return head
